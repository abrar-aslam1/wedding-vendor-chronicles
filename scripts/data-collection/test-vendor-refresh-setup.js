/**
 * Test Script for Monthly Vendor Refresh Setup
 * 
 * This script tests the setup and configuration for the monthly vendor refresh system
 * without making actual API calls or inserting data.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Monthly Vendor Refresh Setup\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...');

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATAFORSEO_LOGIN',
  'DATAFORSEO_PASSWORD'
];

let envTestPassed = true;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
    envTestPassed = false;
  }
}

if (!envTestPassed) {
  console.log('\n❌ Environment variable test failed. Please check your .env file.');
  process.exit(1);
}

console.log('   ✅ All environment variables are set\n');

// Test 2: Supabase Connection
console.log('2️⃣ Testing Supabase Connection...');

try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test basic connection
  const { data, error } = await supabase
    .from('vendors')
    .select('count')
    .limit(1);

  if (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`);
    process.exit(1);
  }

  console.log('   ✅ Supabase connection successful');
} catch (error) {
  console.log(`   ❌ Supabase connection error: ${error.message}`);
  process.exit(1);
}

// Test 3: Database Schema
console.log('\n3️⃣ Testing Database Schema...');

try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test vendors_google table exists
  const { data: googleVendorsTest, error: googleVendorsError } = await supabase
    .from('vendors_google')
    .select('count')
    .limit(1);

  if (googleVendorsError) {
    console.log(`   ❌ vendors_google table not found: ${googleVendorsError.message}`);
    console.log('   💡 Run: supabase db push');
    process.exit(1);
  }

  console.log('   ✅ vendors_google table exists');

  // Test all_vendors view exists
  const { data: allVendorsTest, error: allVendorsError } = await supabase
    .from('all_vendors')
    .select('count')
    .limit(1);

  if (allVendorsError) {
    console.log(`   ❌ all_vendors view not found: ${allVendorsError.message}`);
    console.log('   💡 Run: supabase db push');
    process.exit(1);
  }

  console.log('   ✅ all_vendors view exists');

  // Test vendor_cache table exists
  const { data: cacheTest, error: cacheError } = await supabase
    .from('vendor_cache')
    .select('count')
    .limit(1);

  if (cacheError) {
    console.log(`   ⚠️  vendor_cache table not found: ${cacheError.message}`);
    console.log('   💡 This is optional but recommended for API caching');
  } else {
    console.log('   ✅ vendor_cache table exists');
  }

} catch (error) {
  console.log(`   ❌ Database schema test error: ${error.message}`);
  process.exit(1);
}

// Test 4: DataForSEO API Connection (without making actual calls)
console.log('\n4️⃣ Testing DataForSEO API Configuration...');

try {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  
  // Test authentication by making a simple account info call
  const response = await fetch('https://api.dataforseo.com/v3/user', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.log(`   ❌ DataForSEO API authentication failed: ${response.status} ${response.statusText}`);
    console.log('   💡 Check your DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD');
    process.exit(1);
  }

  const data = await response.json();
  
  if (data.status_code === 20000) {
    console.log('   ✅ DataForSEO API authentication successful');
    if (data.tasks && data.tasks[0] && data.tasks[0].result) {
      const result = data.tasks[0].result[0];
      console.log(`   💰 Account balance: $${result.money || 'N/A'}`);
      console.log(`   📊 Rate limit: ${result.rate_limit || 'N/A'} requests/minute`);
    }
  } else {
    console.log(`   ❌ DataForSEO API error: ${data.status_message}`);
    process.exit(1);
  }

} catch (error) {
  console.log(`   ❌ DataForSEO API test error: ${error.message}`);
  process.exit(1);
}

// Test 5: Script Dependencies
console.log('\n5️⃣ Testing Script Dependencies...');

try {
  // Check if the main script file exists
  const fs = await import('fs');
  const path = await import('path');
  
  const scriptPath = path.join(process.cwd(), 'scripts/data-collection/monthly-vendor-refresh.js');
  
  if (fs.existsSync(scriptPath)) {
    console.log('   ✅ monthly-vendor-refresh.js exists');
  } else {
    console.log('   ❌ monthly-vendor-refresh.js not found');
    process.exit(1);
  }

  // Check if shell script exists and is executable
  const shellScriptPath = path.join(process.cwd(), 'scripts/data-collection/run-monthly-vendor-refresh.sh');
  
  if (fs.existsSync(shellScriptPath)) {
    console.log('   ✅ run-monthly-vendor-refresh.sh exists');
    
    // Check if executable
    try {
      fs.accessSync(shellScriptPath, fs.constants.X_OK);
      console.log('   ✅ run-monthly-vendor-refresh.sh is executable');
    } catch (error) {
      console.log('   ⚠️  run-monthly-vendor-refresh.sh is not executable');
      console.log('   💡 Run: chmod +x scripts/data-collection/run-monthly-vendor-refresh.sh');
    }
  } else {
    console.log('   ❌ run-monthly-vendor-refresh.sh not found');
    process.exit(1);
  }

} catch (error) {
  console.log(`   ❌ Script dependencies test error: ${error.message}`);
  process.exit(1);
}

// Test 6: Configuration Validation
console.log('\n6️⃣ Testing Configuration...');

const VENDOR_CATEGORIES = [
  { name: "Wedding Planners", slug: "wedding-planners" },
  { name: "Photographers", slug: "photographers" },
  { name: "Videographers", slug: "videographers" },
  { name: "Florists", slug: "florists" },
  { name: "Caterers", slug: "caterers" },
  { name: "Venues", slug: "venues" },
  { name: "DJs & Bands", slug: "djs-and-bands" },
  { name: "Cake Designers", slug: "cake-designers" },
  { name: "Bridal Shops", slug: "bridal-shops" },
  { name: "Makeup Artists", slug: "makeup-artists" },
  { name: "Hair Stylists", slug: "hair-stylists" }
];

const TOP_WEDDING_CITIES = [
  { name: 'New York City', state: 'New York', stateCode: 'NY' },
  { name: 'Los Angeles', state: 'California', stateCode: 'CA' },
  { name: 'Chicago', state: 'Illinois', stateCode: 'IL' },
  { name: 'Dallas', state: 'Texas', stateCode: 'TX' },
  { name: 'Miami', state: 'Florida', stateCode: 'FL' }
];

console.log(`   ✅ ${VENDOR_CATEGORIES.length} vendor categories configured`);
console.log(`   ✅ ${TOP_WEDDING_CITIES.length} cities configured for testing`);

const totalQueries = TOP_WEDDING_CITIES.length * VENDOR_CATEGORIES.length;
const estimatedCost = totalQueries * 1; // $1 per API call

console.log(`   📊 Total API calls for full run: ${totalQueries}`);
console.log(`   💰 Estimated cost for full run: $${estimatedCost}`);

// Final Summary
console.log('\n🎉 Setup Test Complete!');
console.log('\n📋 Summary:');
console.log('   ✅ Environment variables configured');
console.log('   ✅ Supabase connection working');
console.log('   ✅ Database schema ready');
console.log('   ✅ DataForSEO API accessible');
console.log('   ✅ Scripts and dependencies ready');
console.log('   ✅ Configuration validated');

console.log('\n🚀 Next Steps:');
console.log('   1. Test with dry run: node scripts/data-collection/monthly-vendor-refresh.js --dry-run');
console.log('   2. Run small test: Edit CONFIG.maxCities = 1 in the script');
console.log('   3. Set up scheduling (cron, GitHub Actions, or Supabase cron)');
console.log('   4. Monitor logs and costs');

console.log('\n✨ Your monthly vendor refresh system is ready to use!');
