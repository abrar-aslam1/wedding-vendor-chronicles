/**
 * Simple CSV Import Script
 * 
 * This script imports CSV data using individual inserts to work around RLS issues.
 */

import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

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

function extractInstagramHandle(url) {
  if (!url) return '';
  
  try {
    const cleanUrl = url.replace(/\/$/, '');
    const patterns = [
      /instagram\.com\/([^\/\?]+)/i,
      /www\.instagram\.com\/([^\/\?]+)/i,
      /^@?([a-zA-Z0-9._]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        return match[1].replace('@', '');
      }
    }
    return '';
  } catch (error) {
    console.warn(`⚠️ Could not extract Instagram handle from: ${url}`);
    return '';
  }
}

function cleanPhoneNumber(phone) {
  if (!phone) return null;
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function cleanWebsiteUrl(url) {
  if (!url) return null;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
}

function standardizeState(state) {
  if (!state) return '';
  
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  const lowerState = state.toLowerCase().trim();
  
  if (state.length === 2) {
    return state.toUpperCase();
  }
  
  return stateMap[lowerState] || state.toUpperCase();
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

function validateAndCleanData(photographers) {
  const validPhotographers = [];
  const errors = [];
  
  for (let i = 0; i < photographers.length; i++) {
    const photographer = photographers[i];
    const rowNumber = i + 2;
    
    const validationErrors = [];
    
    if (!photographer.business_name) {
      validationErrors.push('Missing business name');
    }
    
    if (!photographer.instagram_url && !photographer.instagram_handle) {
      validationErrors.push('Missing Instagram URL or handle');
    }
    
    if (!photographer.city) {
      validationErrors.push('Missing city');
    }
    
    if (!photographer.state) {
      validationErrors.push('Missing state');
    }
    
    if (photographer.phone) {
      photographer.phone = cleanPhoneNumber(photographer.phone);
    }
    
    if (photographer.email) {
      photographer.email = photographer.email.toLowerCase();
      if (!isValidEmail(photographer.email)) {
        validationErrors.push('Invalid email format');
      }
    }
    
    if (photographer.website_url) {
      photographer.website_url = cleanWebsiteUrl(photographer.website_url);
    }
    
    photographer.state = standardizeState(photographer.state);
    
    if (validationErrors.length > 0) {
      errors.push({
        row: rowNumber,
        business_name: photographer.business_name,
        errors: validationErrors
      });
    } else {
      validPhotographers.push(photographer);
    }
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️ Validation Errors Found:');
    errors.forEach(error => {
      console.log(`Row ${error.row} (${error.business_name}): ${error.errors.join(', ')}`);
    });
    console.log(`\n📊 ${errors.length} records had validation errors and will be skipped.`);
  }
  
  return validPhotographers;
}

async function importToDatabase(photographers) {
  if (photographers.length === 0) {
    console.log('⚠️ No valid photographers to import');
    return;
  }
  
  console.log(`📤 Starting database import of ${photographers.length} photographers...`);
  console.log('ℹ️ Using individual inserts to work around RLS restrictions...');
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < photographers.length; i++) {
    const photographer = photographers[i];
    const progress = `${i + 1}/${photographers.length}`;
    
    if ((i + 1) % 50 === 0 || i === photographers.length - 1) {
      console.log(`📦 Processing record ${progress}...`);
    }
    
    try {
      // Try to insert the record
      const { data, error } = await supabase
        .from('instagram_vendors')
        .insert([photographer])
        .select();
      
      if (error) {
        // Check if it's a duplicate
        if (error.code === '23505' || error.message.includes('duplicate')) {
          // Try to update instead
          const { error: updateError } = await supabase
            .from('instagram_vendors')
            .update(photographer)
            .eq('instagram_handle', photographer.instagram_handle)
            .eq('category', photographer.category);
          
          if (updateError) {
            console.log(`⚠️ Skipped ${photographer.business_name}: ${updateError.message}`);
            skipCount++;
          } else {
            successCount++;
          }
        } else {
          console.log(`❌ Failed ${photographer.business_name}: ${error.message}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Exception for ${photographer.business_name}: ${error.message}`);
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    if (i < photographers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} photographers`);
  console.log(`⚠️ Skipped (duplicates): ${skipCount} photographers`);
  console.log(`❌ Failed to import: ${errorCount} photographers`);
  console.log(`📈 Success rate: ${(((successCount + skipCount) / photographers.length) * 100).toFixed(1)}%`);
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
    
    const photographers = await parseCSV(csvFilePath);
    console.log(`📊 Parsed ${photographers.length} photographer records`);
    
    const validPhotographers = validateAndCleanData(photographers);
    console.log(`✅ ${validPhotographers.length} valid records after validation`);
    
    await importToDatabase(validPhotographers);
    
    console.log('🎉 CSV import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CSV import:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
