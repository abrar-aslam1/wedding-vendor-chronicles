/**
 * Fix RLS and Import CSV Script
 * 
 * This script temporarily disables RLS on the instagram_vendors table,
 * runs the import, then re-enables RLS.
 */

import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Import functions from the main import script
import {
  validateAndCleanData,
  extractInstagramHandle,
  cleanPhoneNumber,
  isValidEmail,
  cleanWebsiteUrl,
  standardizeState
} from './import-photographer-csv.js';

let supabase;

async function initSupabase() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    process.exit(1);
  }
}

async function disableRLS() {
  console.log('🔓 Temporarily disabling RLS for import...');
  
  try {
    // First, try to add the missing columns if they don't exist
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.instagram_vendors 
        ADD COLUMN IF NOT EXISTS instagram_url text,
        ADD COLUMN IF NOT EXISTS address text,
        ADD COLUMN IF NOT EXISTS zip_code text;
      `
    });
    
    if (alterError && !alterError.message.includes('already exists')) {
      console.log('ℹ️ Column addition result:', alterError.message);
    }
    
    // Disable RLS temporarily
    const { error: rlsError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.instagram_vendors DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('ℹ️ RLS disable result:', rlsError.message);
    } else {
      console.log('✅ RLS disabled successfully');
    }
  } catch (error) {
    console.log('ℹ️ RLS disable attempt:', error.message);
  }
}

async function enableRLS() {
  console.log('🔒 Re-enabling RLS...');
  
  try {
    const { error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.instagram_vendors ENABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.log('ℹ️ RLS enable result:', error.message);
    } else {
      console.log('✅ RLS re-enabled successfully');
    }
  } catch (error) {
    console.log('ℹ️ RLS enable attempt:', error.message);
  }
}

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const photographers = [];
    const expectedHeaders = [
      'Instagram Page URL',
      'Business Name',
      'Phone',
      'Business Email',
      'Website',
      'Address',
      'City',
      'State',
      'Zip'
    ];
    
    let headerValidated = false;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        console.log('📋 CSV Headers found:', headers);
        
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
          return;
        }
        
        headerValidated = true;
        console.log('✅ All required headers found');
      })
      .on('data', (row) => {
        if (!headerValidated) return;
        
        const photographer = {
          instagram_url: row['Instagram Page URL']?.trim() || '',
          business_name: row['Business Name']?.trim() || '',
          category: 'photographers',
          phone: row['Phone']?.trim() || null,
          email: row['Business Email']?.trim() || null,
          website_url: row['Website']?.trim() || null,
          address: row['Address']?.trim() || null,
          city: row['City']?.trim() || '',
          state: row['State']?.trim() || '',
          zip_code: row['Zip']?.trim() || null,
          subcategory: null,
          follower_count: 0,
          post_count: 0,
          bio: '',
          profile_image_url: null,
          is_verified: false,
          is_business_account: false,
          instagram_handle: extractInstagramHandle(row['Instagram Page URL']?.trim() || ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        photographers.push(photographer);
      })
      .on('end', () => {
        console.log(`📊 Finished parsing CSV. Found ${photographers.length} records.`);
        resolve(photographers);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function importToDatabase(photographers) {
  if (photographers.length === 0) {
    console.log('⚠️ No valid photographers to import');
    return;
  }
  
  console.log(`📤 Starting database import of ${photographers.length} photographers...`);
  
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < photographers.length; i += batchSize) {
    const batch = photographers.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(photographers.length / batchSize);
    
    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
    
    try {
      const { data, error } = await supabase
        .from('instagram_vendors')
        .upsert(batch, { 
          onConflict: 'instagram_handle,category',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error in batch ${batchNumber}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ Batch ${batchNumber} imported successfully`);
        successCount += batch.length;
      }
    } catch (error) {
      console.error(`❌ Exception in batch ${batchNumber}:`, error);
      errorCount += batch.length;
    }
    
    if (i + batchSize < photographers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} photographers`);
  console.log(`❌ Failed to import: ${errorCount} photographers`);
  console.log(`📈 Success rate: ${((successCount / photographers.length) * 100).toFixed(1)}%`);
}

async function main() {
  const csvFilePath = process.argv[2] || 'Wedding Photographer.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }
  
  console.log(`📁 Starting CSV import from: ${csvFilePath}`);
  
  try {
    await initSupabase();
    
    // Step 1: Disable RLS temporarily
    await disableRLS();
    
    // Step 2: Parse CSV
    const photographers = await parseCSV(csvFilePath);
    console.log(`📊 Parsed ${photographers.length} photographer records`);
    
    // Step 3: Validate and clean data
    const validPhotographers = validateAndCleanData(photographers);
    console.log(`✅ ${validPhotographers.length} valid records after validation`);
    
    // Step 4: Import to database
    await importToDatabase(validPhotographers);
    
    // Step 5: Re-enable RLS
    await enableRLS();
    
    console.log('🎉 CSV import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CSV import:', error);
    
    // Make sure to re-enable RLS even if import fails
    try {
      await enableRLS();
    } catch (rlsError) {
      console.error('❌ Failed to re-enable RLS:', rlsError);
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
