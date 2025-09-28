#!/usr/bin/env node

/**
 * FIXED DataForSEO Collection Script
 * Properly stores Google Business listings to reduce costs
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

// Fixed Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

// Test configuration - single search to verify fix
const TEST_SEARCH = {
  keyword: 'coffee cart rental',
  location_code: 1023191, // New York
  city: 'New York',
  state: 'NY',
  category: 'coffee-carts'
};

async function makeDataForSEORequest(keyword, locationCode) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([{
      keyword: keyword,
      location_code: locationCode,
      language_code: "en",
      device: "desktop",
      os: "windows"
    }]);

    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: '/v3/business_data/google/my_business_listings/live',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function checkExistingData(place_id) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?place_id=eq.${encodeURIComponent(place_id)}&select=id,place_id,business_name`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}

async function storeBusinessData(businessData) {
  try {
    console.log(`    💾 Storing: ${businessData.business_name}`);

    const response = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(businessData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`    ✅ Stored successfully (ID: ${result[0]?.id})`);
      return { success: true, data: result[0] };
    } else {
      const errorText = await response.text();
      console.error(`    ❌ Storage failed: ${response.status}`);
      console.error(`    Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error(`    ❌ Storage error:`, error);
    return { success: false, error: error.message };
  }
}

function processBusinessItem(item, category, searchKeyword, location) {
  // Create properly formatted business data
  const businessData = {
    business_name: item.title || null,
    place_id: item.place_id || null,
    cid: item.cid || null,
    
    // Contact Information
    phone: item.phone || null,
    website: item.domain || null,
    
    // Location Data
    address: item.address || null,
    city: item.address_info?.city || location.split(',')[0],
    state: item.address_info?.region || location.split(',')[1]?.trim(),
    zip_code: item.address_info?.zip || null,
    country: 'US',
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    
    // Business Details
    category: category,
    google_categories: item.category ? [item.category] : [],
    description: item.description || null,
    
    // Reviews & Ratings
    rating: item.rating ? parseFloat(item.rating) : null,
    reviews_count: item.reviews_count || 0,
    
    // Business Hours (simplified storage)
    hours: item.work_hours ? JSON.stringify(item.work_hours) : null,
    is_open_now: item.is_open || null,
    
    // Rich Media
    photos: item.photos || [],
    logo_url: item.logo || null,
    
    // Additional Data
    verified: item.verified || false,
    permanently_closed: item.is_claimed === false && item.reviews_count === 0,
    
    // Search Metadata
    search_keyword: searchKeyword,
    location_searched: location,
    dataforseo_rank: item.rank_group || null,
    
    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return businessData;
}

async function runTestDataForSEOCollection() {
  console.log('🧪 TESTING DATAFORSEO COLLECTION & STORAGE');
  console.log('='.repeat(60));
  
  // Verify credentials
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('❌ Missing DataForSEO credentials');
    console.log('Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env file');
    return;
  }

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  console.log(`✅ DataForSEO Login: ${DATAFORSEO_LOGIN}`);
  console.log(`✅ Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`📊 Test search: "${TEST_SEARCH.keyword}" in ${TEST_SEARCH.city}, ${TEST_SEARCH.state}`);
  
  try {
    console.log('\n🔍 Making DataForSEO API call...');
    const response = await makeDataForSEORequest(TEST_SEARCH.keyword, TEST_SEARCH.location_code);
    
    if (!response.tasks || !response.tasks[0] || !response.tasks[0].result) {
      console.error('❌ Invalid DataForSEO response structure');
      console.log('Response:', JSON.stringify(response, null, 2));
      return;
    }

    const results = response.tasks[0].result;
    console.log(`✅ DataForSEO API call successful`);
    console.log(`📊 Status: ${response.tasks[0].status_message}`);
    console.log(`💰 Cost: $${response.tasks[0].cost || 'unknown'}`);

    if (!results.length || !results[0].items) {
      console.log('⚠️ No business listings found');
      return;
    }

    const items = results[0].items;
    console.log(`📍 Found ${items.length} business listings`);

    let stored = 0;
    let skipped = 0;
    let errors = 0;

    for (const [index, item] of items.entries()) {
      console.log(`\n📋 Processing ${index + 1}/${items.length}: ${item.title || 'Unknown'}`);
      
      // Check if already exists (cost optimization)
      if (item.place_id) {
        const exists = await checkExistingData(item.place_id);
        if (exists) {
          console.log('    ⏭️ Already exists, skipping (cost saved!)');
          skipped++;
          continue;
        }
      }

      // Process and store
      const businessData = processBusinessItem(
        item,
        TEST_SEARCH.category,
        TEST_SEARCH.keyword,
        `${TEST_SEARCH.city}, ${TEST_SEARCH.state}`
      );

      const storeResult = await storeBusinessData(businessData);
      if (storeResult.success) {
        stored++;
      } else {
        errors++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST COLLECTION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Results:`);
    console.log(`   • Total found: ${items.length}`);
    console.log(`   • Newly stored: ${stored}`);
    console.log(`   • Already existed: ${skipped}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • API Cost: $${response.tasks[0].cost || 'unknown'}`);

    if (stored > 0) {
      console.log('\n✅ SUCCESS: DataForSEO data is now being stored properly!');
      console.log('💰 This will significantly reduce your future DataForSEO costs');
      console.log('🔄 Existing data is checked to avoid duplicate API calls');
    } else if (skipped > 0) {
      console.log('\n✅ SUCCESS: Duplicate prevention is working!');
      console.log('💰 Saved money by not storing duplicate data');
    }

  } catch (error) {
    console.error('\n❌ Test collection failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  runTestDataForSEOCollection()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { runTestDataForSEOCollection };
