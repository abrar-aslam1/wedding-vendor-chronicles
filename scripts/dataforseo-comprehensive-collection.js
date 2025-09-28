#!/usr/bin/env node

/**
 * Comprehensive DataForSEO Cart Vendor Collection System
 * Extracts maximum data from Google Business listings and stores in database
 */

import https from 'https';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive search configuration
const CART_CATEGORIES = {
  'coffee-carts': [
    'coffee cart rental',
    'mobile coffee bar',
    'espresso cart catering',
    'wedding coffee cart'
  ],
  'matcha-carts': [
    'matcha cart',
    'mobile matcha bar',
    'matcha catering'
  ],
  'cocktail-carts': [
    'cocktail cart rental',
    'mobile bar service',
    'wedding bar cart',
    'portable bar rental'
  ],
  'dessert-carts': [
    'dessert cart catering',
    'ice cream cart',
    'mobile dessert bar',
    'wedding dessert cart'
  ],
  'flower-carts': [
    'flower cart rental',
    'mobile flower bar',
    'wedding flower cart'
  ],
  'champagne-carts': [
    'champagne cart service',
    'mobile champagne bar',
    'prosecco cart rental'
  ]
};

// Major US cities with location codes (DataForSEO format)
const TARGET_CITIES = {
  'New York': { code: 1023191, state: 'NY' },
  'Los Angeles': { code: 2840, state: 'CA' },
  'Chicago': { code: 1016367, state: 'IL' },
  'Miami': { code: 1015254, state: 'FL' },
  'Dallas': { code: 1019584, state: 'TX' },
  'Seattle': { code: 1026916, state: 'WA' },
  'Boston': { code: 1025469, state: 'MA' },
  'Atlanta': { code: 1014448, state: 'GA' },
  'San Francisco': { code: 2840, state: 'CA' },
  'Las Vegas': { code: 1012825, state: 'NV' }
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

function extractBusinessData(item, category, searchKeyword, locationSearched) {
  // Extract comprehensive data from DataForSEO response
  const businessData = {
    business_name: item.title || null,
    place_id: item.place_id || null,
    cid: item.cid || null,
    
    // Contact Information
    phone: item.phone || null,
    website: item.domain || null,
    
    // Location Data
    address: item.address || null,
    city: item.address_info?.city || locationSearched.split(',')[0],
    state: item.address_info?.region || null,
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
    reviews_data: item.reviews_data ? JSON.stringify(item.reviews_data.slice(0, 5)) : null, // Store first 5 reviews
    
    // Business Hours
    hours: item.work_hours ? JSON.stringify(item.work_hours) : null,
    is_open_now: item.is_open || null,
    
    // Rich Media
    photos: item.photos || [],
    logo_url: item.logo || null,
    
    // Additional Data
    verified: item.verified || false,
    permanently_closed: item.is_claimed === false && item.reviews_count === 0,
    temporarily_closed: false, // Would need to parse from description/status
    
    // Search Metadata
    search_keyword: searchKeyword,
    location_searched: locationSearched,
    dataforseo_rank: item.rank_group || null
  };

  return businessData;
}

async function storeVendors(vendors) {
  if (!vendors || vendors.length === 0) {
    console.log('No vendors to store');
    return { success: true, count: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('vendors_google_business')
      .upsert(vendors, {
        onConflict: 'place_id',
        ignoreDuplicates: false // Update existing records with new data
      });

    if (error) {
      console.error('Error storing vendors:', error);
      return { success: false, error };
    }

    console.log(`✅ Stored/updated ${vendors.length} vendors successfully`);
    return { success: true, count: vendors.length };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error };
  }
}

async function collectVendorsForSearch(category, searchTerms, city, locationInfo) {
  const allVendors = [];
  
  for (const searchTerm of searchTerms) {
    console.log(`  🔍 Searching: "${searchTerm}" in ${city}`);
    
    try {
      const response = await makeDataForSEORequest(searchTerm, locationInfo.code);
      
      if (response.tasks && response.tasks[0] && response.tasks[0].result) {
        const results = response.tasks[0].result;
        
        if (results.length > 0 && results[0].items) {
          const items = results[0].items;
          console.log(`    📍 Found ${items.length} businesses`);
          
          for (const item of items) {
            const businessData = extractBusinessData(
              item, 
              category, 
              searchTerm, 
              `${city}, ${locationInfo.state}`
            );
            
            // Basic quality filtering
            if (businessData.business_name && 
                (businessData.phone || businessData.website) &&
                businessData.rating >= 3.0) {
              allVendors.push(businessData);
            }
          }
        } else {
          console.log(`    ⚠️ No results for "${searchTerm}"`);
        }
      }
      
      // Rate limiting: Wait 6 seconds between requests (10 requests/minute max)
      await new Promise(resolve => setTimeout(resolve, 6000));
      
    } catch (error) {
      console.error(`    ❌ Error searching "${searchTerm}":`, error.message);
      continue;
    }
  }
  
  return allVendors;
}

async function runComprehensiveCollection() {
  console.log('🚀 Starting Comprehensive DataForSEO Cart Vendor Collection');
  console.log('=================================================================');
  
  // Verify credentials
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('❌ Missing DataForSEO credentials');
    return;
  }
  
  console.log(`✅ Credentials verified for: ${DATAFORSEO_LOGIN}`);
  console.log(`📊 Target: ${Object.keys(CART_CATEGORIES).length} categories × ${Object.keys(TARGET_CITIES).length} cities`);
  
  const collectionResults = {
    totalVendors: 0,
    totalSearches: 0,
    errors: 0,
    byCategory: {},
    byCity: {}
  };
  
  // Process each category
  for (const [category, searchTerms] of Object.entries(CART_CATEGORIES)) {
    console.log(`\n📦 Processing Category: ${category.toUpperCase()}`);
    console.log('-'.repeat(50));
    
    collectionResults.byCategory[category] = 0;
    
    // Process each city for this category
    for (const [city, locationInfo] of Object.entries(TARGET_CITIES)) {
      console.log(`\n🏙️ Processing: ${city}, ${locationInfo.state}`);
      
      const vendors = await collectVendorsForSearch(category, searchTerms, city, locationInfo);
      collectionResults.totalSearches += searchTerms.length;
      
      if (vendors.length > 0) {
        const storeResult = await storeVendors(vendors);
        
        if (storeResult.success) {
          collectionResults.totalVendors += storeResult.count;
          collectionResults.byCategory[category] += storeResult.count;
          collectionResults.byCity[city] = (collectionResults.byCity[city] || 0) + storeResult.count;
          console.log(`  ✅ ${city}: ${storeResult.count} vendors stored`);
        } else {
          collectionResults.errors++;
          console.log(`  ❌ ${city}: Storage failed`);
        }
      } else {
        console.log(`  ⚠️ ${city}: No qualified vendors found`);
      }
    }
    
    console.log(`📊 Category "${category}" complete: ${collectionResults.byCategory[category]} vendors`);
  }
  
  // Final summary
  console.log('\n=================================================================');
  console.log('🎉 COLLECTION COMPLETE!');
  console.log('=================================================================');
  console.log(`📊 Total Vendors Collected: ${collectionResults.totalVendors}`);
  console.log(`🔍 Total Searches Performed: ${collectionResults.totalSearches}`);
  console.log(`❌ Errors Encountered: ${collectionResults.errors}`);
  
  console.log('\n📦 By Category:');
  Object.entries(collectionResults.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} vendors`);
  });
  
  console.log('\n🏙️ By City:');
  Object.entries(collectionResults.byCity).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} vendors`);
  });
  
  return collectionResults;
}

// Run the collection if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveCollection()
    .then((results) => {
      console.log(`\n✅ Collection completed successfully! Total vendors: ${results.totalVendors}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Collection failed:', error);
      process.exit(1);
    });
}

export { runComprehensiveCollection, collectVendorsForSearch, storeVendors };
