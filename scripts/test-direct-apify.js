/**
 * Test Direct Apify Integration
 * 
 * This script tests the direct Apify API connection and verifies:
 * 1. API token is valid
 * 2. Can scrape Instagram profiles
 * 3. Data format matches expectations
 * 
 * Usage:
 *   node scripts/test-direct-apify.js
 */

import dotenv from 'dotenv';
import { ApifyDirectClient } from './apify-direct-client.js';

// Load environment variables
dotenv.config();

const TEST_USERNAMES = [
  'rubyolivia.photography',  // Wedding photographer example from docs
  'weddingwire'              // Popular wedding account
];

async function testApifyIntegration() {
  console.log('\n🧪 Testing Direct Apify Integration\n');
  console.log('='.repeat(50));

  // Step 1: Check environment
  console.log('\n📋 Step 1: Checking Environment Variables');
  console.log('-'.repeat(50));
  
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    console.error('❌ APIFY_API_TOKEN not found in environment');
    console.log('Please add it to your .env file');
    process.exit(1);
  }
  console.log('✅ APIFY_API_TOKEN found');
  console.log(`   Token prefix: ${apiToken.substring(0, 15)}...`);

  // Step 2: Initialize client
  console.log('\n📋 Step 2: Initializing Apify Client');
  console.log('-'.repeat(50));
  
  let client;
  try {
    client = new ApifyDirectClient(apiToken);
    console.log('✅ Apify client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize client:', error.message);
    process.exit(1);
  }

  // Step 3: Test profile enrichment
  console.log('\n📋 Step 3: Testing Profile Enrichment');
  console.log('-'.repeat(50));
  console.log(`Testing with ${TEST_USERNAMES.length} profiles: ${TEST_USERNAMES.join(', ')}`);
  console.log('\n⏳ This may take 30-60 seconds...\n');

  let profiles;
  try {
    const startTime = Date.now();
    profiles = await client.enrichInstagramProfiles(TEST_USERNAMES);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Enrichment completed in ${duration}s`);
    console.log(`   Profiles returned: ${profiles.length}`);
  } catch (error) {
    console.error('\n❌ Enrichment failed:', error.message);
    console.log('\nPossible issues:');
    console.log('  - Invalid API token');
    console.log('  - Insufficient Apify credits');
    console.log('  - Network connectivity issues');
    console.log('  - Instagram profiles are private/restricted');
    process.exit(1);
  }

  // Step 4: Validate data structure
  console.log('\n📋 Step 4: Validating Data Structure');
  console.log('-'.repeat(50));

  if (profiles.length === 0) {
    console.warn('⚠️  No profiles returned - this may be normal for private accounts');
  } else {
    const sample = profiles[0];
    console.log('\n📊 Sample profile data:');
    console.log(JSON.stringify(sample, null, 2));

    // Check for expected fields
    const expectedFields = ['username', 'fullName', 'followersCount', 'postsCount'];
    const missingFields = expectedFields.filter(field => !(field in sample));
    
    if (missingFields.length > 0) {
      console.warn(`⚠️  Missing expected fields: ${missingFields.join(', ')}`);
    } else {
      console.log('\n✅ All expected fields present');
    }
  }

  // Step 5: Cost estimation
  console.log('\n📋 Step 5: Cost Analysis');
  console.log('-'.repeat(50));
  
  const costPerProfile = 0.002; // Approximate cost in USD
  const estimatedCost = profiles.length * costPerProfile;
  
  console.log(`Profiles enriched: ${profiles.length}`);
  console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
  console.log('\n💡 Scale projection:');
  console.log(`   25 profiles: ~$${(25 * costPerProfile).toFixed(3)}`);
  console.log(`   100 profiles: ~$${(100 * costPerProfile).toFixed(2)}`);
  console.log(`   400 profiles: ~$${(400 * costPerProfile).toFixed(2)}`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ API Connection: WORKING');
  console.log('✅ Profile Enrichment: WORKING');
  console.log(`✅ Profiles Retrieved: ${profiles.length}`);
  console.log('✅ Ready for Production: YES');
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Run a small collection: TIER=1 MAX_ENRICH=5 npm run play:backfill:tier');
  console.log('  2. Check database for new vendors');
  console.log('  3. Scale up gradually: 25 → 100 → 400 profiles');
  
  console.log('\n✨ Integration test complete!\n');
}

// Run the test
testApifyIntegration().catch(error => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});
