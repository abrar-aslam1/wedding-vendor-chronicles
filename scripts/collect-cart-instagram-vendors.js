#!/usr/bin/env node

/**
 * Instagram Cart Vendor Collection Script
 * Collects Instagram vendors for all mobile cart services in Tier 1 cities
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cart categories and cities configuration
const CART_CATEGORIES = [
  'coffee-carts',
  'matcha-carts', 
  'cocktail-carts',
  'dessert-carts',
  'flower-carts',
  'champagne-carts'
];

const TIER_1_CITIES = [
  { name: 'New York', state: 'NY' },
  { name: 'Los Angeles', state: 'CA' },
  { name: 'Chicago', state: 'IL' },
  { name: 'Miami', state: 'FL' },
  { name: 'Dallas', state: 'TX' },
  { name: 'Seattle', state: 'WA' },
  { name: 'Boston', state: 'MA' },
  { name: 'Atlanta', state: 'GA' }
];

// Collection statistics
const stats = {
  totalCollections: 0,
  successfulCollections: 0,
  failedCollections: 0,
  totalVendorsCollected: 0,
  startTime: Date.now()
};

/**
 * Run collection for a specific city and category
 */
async function collectCityCategory(city, state, category) {
  console.log(`\n📍 Collecting ${category} in ${city}, ${state}`);
  
  const env = {
    ...process.env,
    CITY: city,
    STATE: state,
    CATEGORY: category,
    LIMIT_PER_ROW: '20',  // Target ~20 vendors per category
    MAX_ENRICH: '25',      // Small batch to stay within rate limits
    CSV_FILE: path.join(__dirname, '..', 'data', 'ig_carts_seed.csv')
  };
  
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', 'play:backfill:city'], {
        env,
        stdio: 'pipe'
      });
      
      let output = '';
      let vendorCount = 0;
      
      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Log progress
        if (text.includes('🔧 MCP Tool:') || text.includes('✅ Playbook completed')) {
          process.stdout.write(text);
        }
        
        // Extract vendor count from output
        const vendorMatch = text.match(/Processed (\d+) vendors/);
        if (vendorMatch) {
          vendorCount = parseInt(vendorMatch[1], 10);
        }
      });
      
      child.stderr.on('data', (data) => {
        console.error(`❌ Error: ${data}`);
      });
      
      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Collection failed for ${category} in ${city}, ${state}`);
          stats.failedCollections++;
          reject(new Error(`Process exited with code ${code}`));
        } else {
          console.log(`✅ Successfully collected ${vendorCount} vendors for ${category} in ${city}, ${state}`);
          stats.successfulCollections++;
          stats.totalVendorsCollected += vendorCount;
          resolve(vendorCount);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error collecting ${category} in ${city}, ${state}:`, error.message);
    stats.failedCollections++;
    return 0;
  }
}

/**
 * Delay function for rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main collection function
 */
async function collectAllCartVendors() {
  console.log('🚀 Starting Instagram Cart Vendor Collection');
  console.log('===========================================');
  console.log(`📊 Configuration:`);
  console.log(`  - Cities: ${TIER_1_CITIES.length} Tier 1 cities`);
  console.log(`  - Categories: ${CART_CATEGORIES.length} cart types`);
  console.log(`  - Total collections: ${TIER_1_CITIES.length * CART_CATEGORIES.length}`);
  console.log(`  - Target: ~20 vendors per category per city`);
  console.log('===========================================\n');
  
  // Process cities one at a time to respect rate limits
  for (const city of TIER_1_CITIES) {
    console.log(`\n🌆 Processing ${city.name}, ${city.state}`);
    console.log('----------------------------------------');
    
    for (const category of CART_CATEGORIES) {
      stats.totalCollections++;
      
      try {
        await collectCityCategory(city.name, city.state, category);
        
        // Add delay between collections to respect rate limits (60 seconds)
        console.log(`⏳ Waiting 60 seconds before next collection (rate limiting)...`);
        await delay(60000);
        
      } catch (error) {
        console.error(`❌ Failed to collect ${category} in ${city.name}, ${city.state}`);
        // Continue with next category
      }
    }
    
    // Print progress after each city
    const elapsed = Math.round((Date.now() - stats.startTime) / 1000 / 60);
    console.log(`\n📊 Progress Update:`);
    console.log(`  - Collections completed: ${stats.totalCollections}/${TIER_1_CITIES.length * CART_CATEGORIES.length}`);
    console.log(`  - Successful: ${stats.successfulCollections}`);
    console.log(`  - Failed: ${stats.failedCollections}`);
    console.log(`  - Total vendors collected: ${stats.totalVendorsCollected}`);
    console.log(`  - Time elapsed: ${elapsed} minutes`);
  }
}

/**
 * Print final statistics
 */
function printFinalStats() {
  const totalTime = Math.round((Date.now() - stats.startTime) / 1000 / 60);
  
  console.log('\n');
  console.log('===========================================');
  console.log('📊 FINAL COLLECTION STATISTICS');
  console.log('===========================================');
  console.log(`✅ Successful collections: ${stats.successfulCollections}`);
  console.log(`❌ Failed collections: ${stats.failedCollections}`);
  console.log(`📦 Total vendors collected: ${stats.totalVendorsCollected}`);
  console.log(`⏱️ Total time: ${totalTime} minutes`);
  console.log(`📈 Average vendors per collection: ${Math.round(stats.totalVendorsCollected / stats.successfulCollections)}`);
  console.log('===========================================');
  
  if (stats.failedCollections > 0) {
    console.log('\n⚠️ Some collections failed. You may want to re-run the script or check the logs.');
  } else {
    console.log('\n🎉 All collections completed successfully!');
  }
}

/**
 * Run quality control check
 */
async function runQualityCheck() {
  console.log('\n📋 Running Quality Control Check...');
  
  try {
    const { spawn } = await import('child_process');
    
    const child = spawn('npm', ['run', 'play:qc:daily'], {
      stdio: 'inherit'
    });
    
    return new Promise((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Quality control check completed');
        } else {
          console.log('⚠️ Quality control check had issues');
        }
        resolve();
      });
    });
  } catch (error) {
    console.error('❌ Failed to run quality control check:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check environment
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      console.error('❌ Missing required environment variables');
      console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE are set in .env or .env.local');
      process.exit(1);
    }
    
    // Run collection
    await collectAllCartVendors();
    
    // Print statistics
    printFinalStats();
    
    // Run quality check
    await runQualityCheck();
    
    console.log('\n✨ Cart vendor collection complete!');
    
  } catch (error) {
    console.error('\n❌ Fatal error during collection:', error);
    printFinalStats();
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Collection interrupted by user');
  printFinalStats();
  process.exit(0);
});

// Run the script
main().catch(console.error);
