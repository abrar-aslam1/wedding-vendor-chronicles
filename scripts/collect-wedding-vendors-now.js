/**
 * Collect Wedding Vendors NOW - Simple Direct Collection
 * 
 * This script bypasses the complex YAML workflow and directly:
 * 1. Takes a list of known wedding vendor Instagram handles
 * 2. Scrapes them via Apify
 * 3. Sends them to your Supabase database
 * 
 * Usage: node scripts/collect-wedding-vendors-now.js
 */

import dotenv from 'dotenv';
import { ApifyDirectClient } from './apify-direct-client.js';

dotenv.config();

// Wedding vendor Instagram handles to collect (you can add more!)
const WEDDING_VENDORS = [
  'rubyolivia.photography',  // Wedding photographer (already tested)
  'weddingwire',              // Wedding platform (already tested)
  'stylemepretty',            // Wedding inspiration
  'junebugweddings',          // Wedding blog
  'greenweddingshoes',        // Wedding blog
  'theknot',                  // Wedding platform
  'brides',                   // Bridal magazine
  'marthastewartweddings',    // Wedding magazine
  'oncewed',                  // Wedding blog
  'ruffledblog'               // Wedding blog
];

async function collectWeddingVendors() {
  console.log('\n🎉 Collecting Wedding Vendors - Direct Method\n');
  console.log('='.repeat(60));
  
  // Check environment
  const apifyToken = process.env.APIFY_API_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const ingestKey = process.env.INGEST_SHARED_KEY;
  
  if (!apifyToken) {
    console.error('❌ APIFY_API_TOKEN not found');
    process.exit(1);
  }
  
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL not found');
    process.exit(1);
  }
  
  if (!ingestKey) {
    console.error('❌ INGEST_SHARED_KEY not found');
    process.exit(1);
  }
  
  console.log('✅ Environment configured');
  console.log(`📍 Supabase: ${supabaseUrl}`);
  console.log(`👰 Collecting ${WEDDING_VENDORS.length} wedding vendor profiles\n`);
  
  // Initialize Apify client
  const apifyClient = new ApifyDirectClient(apifyToken);
  
  // Scrape Instagram profiles
  console.log('📸 Step 1: Scraping Instagram profiles via Apify...\n');
  let profiles;
  try {
    profiles = await apifyClient.enrichInstagramProfiles(WEDDING_VENDORS);
    console.log(`\n✅ Retrieved ${profiles.length} Instagram posts/profiles\n`);
  } catch (error) {
    console.error('❌ Apify scraping failed:', error.message);
    process.exit(1);
  }
  
  // Extract unique owners (actual vendors)
  console.log('🔄 Step 2: Extracting vendor profiles...\n');
  const vendorMap = new Map();
  
  for (const post of profiles) {
    const username = post.ownerUsername;
    const name = post.ownerFullName || username;
    const ownerId = post.ownerId;
    
    if (username && !vendorMap.has(username)) {
      vendorMap.set(username, {
        ig_username: username.toLowerCase(),
        display_name: name,
        ig_user_id: ownerId,
        bio: `Wedding vendor/influencer - ${name}`,
        category: 'wedding-photographers', // Default category
        city: 'New York',  // Default city
        state: 'NY',       // Default state  
        source: 'apify_direct_collect',
        profile_pic_url: post.displayUrl || null,
        posts_count: 1,
        has_contact: false,
        has_location: true
      });
    }
  }
  
  const vendors = Array.from(vendorMap.values());
  console.log(`✅ Extracted ${vendors.length} unique vendors\n`);
  
  // Send to Supabase
  console.log('💾 Step 3: Sending to database...\n');
  const ingestUrl = `${supabaseUrl}/functions/v1/ingest-instagram`;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  try {
    const response = await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Ingest-Key': ingestKey
      },
      body: JSON.stringify({ vendors })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Database ingest complete!\n');
    console.log('📊 Results:');
    console.log(`   Total processed: ${result.processed}`);
    console.log(`   Successfully added/updated: ${result.successful}`);
    console.log(`   Failed: ${result.failed}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\n📝 Vendors added:');
      result.results.forEach(r => {
        console.log(`   ✓ ${r.vendor} (${r.action})`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(e => {
        console.log(`   ✗ ${e.vendor}: ${e.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database ingest failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Collection Complete!');
  console.log('='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. Check your database: SELECT COUNT(*) FROM instagram_vendors;');
  console.log('2. Add more vendor usernames to WEDDING_VENDORS array');
  console.log('3. Run this script again to add more!\n');
}

// Run it
collectWeddingVendors().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
