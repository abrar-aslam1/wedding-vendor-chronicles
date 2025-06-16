/**
 * CSV Import Script for Photographer Data
 * 
 * This script imports photographer data from a CSV file with the following headers:
 * "Instagram Page URL", "Business Name", "Phone", "Business Email", "Website", "Address", "City", "State", "Zip"
 * 
 * Usage: node scripts/data-collection/import-photographer-csv.js <path-to-csv-file>
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Import Supabase client
let supabase;
async function initSupabase() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Try to use service role key first (for imports), fallback to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🔑 Using service role key for import (bypasses RLS)');
    } else {
      console.log('🔑 Using anon key - may need RLS policies for import');
    }
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    process.exit(1);
  }
}

/**
 * Main function to import CSV data
 */
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('❌ Please provide a CSV file path as an argument');
    console.log('Usage: node scripts/data-collection/import-photographer-csv.js <path-to-csv-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }
  
  console.log(`📁 Starting CSV import from: ${csvFilePath}`);
  
  try {
    // Initialize Supabase client
    await initSupabase();
    
    // Parse and import CSV data
    const photographers = await parseCSV(csvFilePath);
    console.log(`📊 Parsed ${photographers.length} photographer records`);
    
    // Validate and clean data
    const validPhotographers = validateAndCleanData(photographers);
    console.log(`✅ ${validPhotographers.length} valid records after validation`);
    
    // Import to database
    await importToDatabase(validPhotographers);
    
    console.log('🎉 CSV import completed successfully!');
  } catch (error) {
    console.error('❌ Error during CSV import:', error);
    process.exit(1);
  }
}

/**
 * Parse CSV file and return array of photographer objects
 */
function parseCSV(filePath) {
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
        
        // Validate headers
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
        
        // Map CSV columns to database columns
        const photographer = {
          // Required fields
          instagram_url: row['Instagram Page URL']?.trim() || '',
          business_name: row['Business Name']?.trim() || '',
          category: 'photographers', // Fixed value for all imports
          
          // Contact information
          phone: row['Phone']?.trim() || null,
          email: row['Business Email']?.trim() || null,
          website_url: row['Website']?.trim() || null,
          
          // Location information
          address: row['Address']?.trim() || null,
          city: row['City']?.trim() || '',
          state: row['State']?.trim() || '',
          zip_code: row['Zip']?.trim() || null,
          
          // Default values
          subcategory: null, // Will be determined later
          follower_count: 0,
          post_count: 0,
          bio: '',
          profile_image_url: null,
          is_verified: false,
          is_business_account: false,
          
          // Extract Instagram handle from URL
          instagram_handle: extractInstagramHandle(row['Instagram Page URL']?.trim() || ''),
          
          // Metadata
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

/**
 * Extract Instagram handle from Instagram URL
 */
function extractInstagramHandle(url) {
  if (!url) return '';
  
  try {
    // Remove trailing slashes and clean up URL
    const cleanUrl = url.replace(/\/$/, '');
    
    // Extract handle from various Instagram URL formats
    const patterns = [
      /instagram\.com\/([^\/\?]+)/i,
      /www\.instagram\.com\/([^\/\?]+)/i,
      /^@?([a-zA-Z0-9._]+)$/ // Direct handle format
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        return match[1].replace('@', ''); // Remove @ if present
      }
    }
    
    return '';
  } catch (error) {
    console.warn(`⚠️ Could not extract Instagram handle from: ${url}`);
    return '';
  }
}

/**
 * Validate and clean photographer data
 */
function validateAndCleanData(photographers) {
  const validPhotographers = [];
  const errors = [];
  
  for (let i = 0; i < photographers.length; i++) {
    const photographer = photographers[i];
    const rowNumber = i + 2; // +2 because CSV rows start at 2 (after header)
    
    // Validation rules
    const validationErrors = [];
    
    // Required fields
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
    
    // Data cleaning
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
    
    // State standardization
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
  
  // Report validation errors
  if (errors.length > 0) {
    console.log('\n⚠️ Validation Errors Found:');
    errors.forEach(error => {
      console.log(`Row ${error.row} (${error.business_name}): ${error.errors.join(', ')}`);
    });
    console.log(`\n📊 ${errors.length} records had validation errors and will be skipped.`);
  }
  
  return validPhotographers;
}

/**
 * Clean and standardize phone number
 */
function cleanPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different phone number formats
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if we can't standardize
  return phone;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Clean and standardize website URL
 */
function cleanWebsiteUrl(url) {
  if (!url) return null;
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
}

/**
 * Standardize state abbreviations
 */
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
  
  // If it's already an abbreviation, return uppercase
  if (state.length === 2) {
    return state.toUpperCase();
  }
  
  // Look up full state name
  return stateMap[lowerState] || state.toUpperCase();
}

/**
 * Import photographers to database in batches
 */
async function importToDatabase(photographers) {
  if (photographers.length === 0) {
    console.log('⚠️ No valid photographers to import');
    return;
  }
  
  console.log(`📤 Starting database import of ${photographers.length} photographers...`);
  
  const batchSize = 50; // Import in batches to avoid timeouts
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
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < photographers.length) {
      await delay(1000); // 1 second delay
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} photographers`);
  console.log(`❌ Failed to import: ${errorCount} photographers`);
  console.log(`📈 Success rate: ${((successCount / photographers.length) * 100).toFixed(1)}%`);
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  main,
  parseCSV,
  validateAndCleanData,
  extractInstagramHandle,
  cleanPhoneNumber,
  isValidEmail,
  cleanWebsiteUrl,
  standardizeState
};
