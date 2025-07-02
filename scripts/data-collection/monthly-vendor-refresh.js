/**
 * Monthly Vendor Refresh Script
 * 
 * This script runs monthly to collect fresh vendor data from Google Maps via DataForSEO API
 * and stores it in the vendors_google table in Supabase.
 * 
 * Usage: node scripts/data-collection/monthly-vendor-refresh.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  console.error('Missing DataForSEO credentials in environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Wedding vendor categories
const VENDOR_CATEGORIES = [
  { name: "Wedding Planners", slug: "wedding-planners", keywords: ["wedding planner", "event planner", "wedding coordinator"] },
  { name: "Photographers", slug: "photographers", keywords: ["wedding photographer", "photography", "photo"] },
  { name: "Videographers", slug: "videographers", keywords: ["wedding videographer", "videography", "video"] },
  { name: "Florists", slug: "florists", keywords: ["wedding florist", "floral", "flowers"] },
  { name: "Caterers", slug: "caterers", keywords: ["wedding caterer", "catering", "food"] },
  { name: "Venues", slug: "venues", keywords: ["wedding venue", "event venue", "reception hall"] },
  { name: "DJs & Bands", slug: "djs-and-bands", keywords: ["wedding dj", "wedding band", "entertainment"] },
  { name: "Cake Designers", slug: "cake-designers", keywords: ["wedding cake", "cake designer", "bakery"] },
  { name: "Bridal Shops", slug: "bridal-shops", keywords: ["bridal shop", "wedding dress", "bridal gown"] },
  { name: "Makeup Artists", slug: "makeup-artists", keywords: ["wedding makeup", "makeup artist", "bridal makeup"] },
  { name: "Hair Stylists", slug: "hair-stylists", keywords: ["wedding hair", "hair stylist", "bridal hair"] }
];

// Top wedding cities (Tier 1 from cities.ts)
const TOP_WEDDING_CITIES = [
  { name: 'New York City', state: 'New York', stateCode: 'NY' },
  { name: 'Los Angeles', state: 'California', stateCode: 'CA' },
  { name: 'Chicago', state: 'Illinois', stateCode: 'IL' },
  { name: 'San Francisco', state: 'California', stateCode: 'CA' },
  { name: 'Boston', state: 'Massachusetts', stateCode: 'MA' },
  { name: 'Philadelphia', state: 'Pennsylvania', stateCode: 'PA' },
  { name: 'Miami', state: 'Florida', stateCode: 'FL' },
  { name: 'Atlanta', state: 'Georgia', stateCode: 'GA' },
  { name: 'Dallas', state: 'Texas', stateCode: 'TX' },
  { name: 'Houston', state: 'Texas', stateCode: 'TX' },
  { name: 'Seattle', state: 'Washington', stateCode: 'WA' },
  { name: 'Denver', state: 'Colorado', stateCode: 'CO' },
  { name: 'Las Vegas', state: 'Nevada', stateCode: 'NV' },
  { name: 'San Diego', state: 'California', stateCode: 'CA' },
  { name: 'Phoenix', state: 'Arizona', stateCode: 'AZ' },
  { name: 'Austin', state: 'Texas', stateCode: 'TX' },
  { name: 'Nashville', state: 'Tennessee', stateCode: 'TN' },
  { name: 'Charlotte', state: 'North Carolina', stateCode: 'NC' },
  { name: 'Tampa', state: 'Florida', stateCode: 'FL' },
  { name: 'Orlando', state: 'Florida', stateCode: 'FL' }
];

// State abbreviation mapping
const STATE_ABBREVIATIONS = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

// Configuration
const CONFIG = {
  batchSize: 5, // Number of concurrent API requests
  delayBetweenBatches: 2000, // Delay in milliseconds
  maxResultsPerQuery: 50, // Maximum results to fetch per query
  dryRun: false, // Set to true to test without inserting data
  onlyRefreshOlderThan: 30 // Only refresh data older than X days
};

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Monthly Vendor Refresh');
  console.log(`📊 Processing ${TOP_WEDDING_CITIES.length} cities × ${VENDOR_CATEGORIES.length} categories = ${TOP_WEDDING_CITIES.length * VENDOR_CATEGORIES.length} total queries`);
  
  const startTime = Date.now();
  let totalVendorsCollected = 0;
  let totalApiCalls = 0;
  let totalApiCost = 0;
  const errors = [];

  try {
    // Process cities in batches
    for (let i = 0; i < TOP_WEDDING_CITIES.length; i += CONFIG.batchSize) {
      const cityBatch = TOP_WEDDING_CITIES.slice(i, i + CONFIG.batchSize);
      console.log(`\n📍 Processing cities batch ${Math.floor(i/CONFIG.batchSize) + 1}/${Math.ceil(TOP_WEDDING_CITIES.length/CONFIG.batchSize)}`);
      
      // Process each city in the batch
      const cityPromises = cityBatch.map(async (city) => {
        console.log(`\n🏙️  Processing ${city.name}, ${city.stateCode}`);
        
        for (const category of VENDOR_CATEGORIES) {
          try {
            console.log(`  📋 Category: ${category.name}`);
            
            // Check if we need to refresh this city/category combination
            const shouldRefresh = await shouldRefreshData(city, category);
            if (!shouldRefresh) {
              console.log(`  ⏭️  Skipping ${category.name} in ${city.name} (data is fresh)`);
              continue;
            }
            
            // Collect vendors for this city/category
            const result = await collectVendorsForCityCategory(city, category);
            totalVendorsCollected += result.vendorsCollected;
            totalApiCalls += result.apiCalls;
            totalApiCost += result.apiCost;
            
            console.log(`  ✅ Collected ${result.vendorsCollected} vendors for ${category.name} in ${city.name}`);
            
            // Small delay between categories
            await delay(500);
          } catch (error) {
            const errorMsg = `Error processing ${category.name} in ${city.name}: ${error.message}`;
            console.error(`  ❌ ${errorMsg}`);
            errors.push(errorMsg);
          }
        }
      });
      
      // Wait for all cities in batch to complete
      await Promise.all(cityPromises);
      
      // Delay between batches
      if (i + CONFIG.batchSize < TOP_WEDDING_CITIES.length) {
        console.log(`⏳ Waiting ${CONFIG.delayBetweenBatches}ms before next batch...`);
        await delay(CONFIG.delayBetweenBatches);
      }
    }
    
    // Final summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Monthly Vendor Refresh Complete!');
    console.log('📊 Summary:');
    console.log(`  ⏱️  Duration: ${duration} seconds`);
    console.log(`  👥 Total vendors collected: ${totalVendorsCollected}`);
    console.log(`  📞 Total API calls: ${totalApiCalls}`);
    console.log(`  💰 Total API cost: $${totalApiCost.toFixed(2)}`);
    console.log(`  ❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Log summary to database for monitoring
    await logExecutionSummary({
      duration,
      totalVendorsCollected,
      totalApiCalls,
      totalApiCost,
      errorCount: errors.length,
      errors: errors.slice(0, 10) // Store first 10 errors
    });
    
  } catch (error) {
    console.error('💥 Fatal error in main execution:', error);
    process.exit(1);
  }
}

/**
 * Check if we should refresh data for a city/category combination
 */
async function shouldRefreshData(city, category) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.onlyRefreshOlderThan);
    
    const { data, error } = await supabase
      .from('vendors_google')
      .select('id, last_updated')
      .eq('city', city.name)
      .eq('state', city.state)
      .eq('category', category.slug)
      .gte('last_updated', cutoffDate.toISOString())
      .limit(1);
    
    if (error) {
      console.log(`    ⚠️  Error checking refresh status: ${error.message}`);
      return true; // Refresh on error
    }
    
    // If we have recent data, skip refresh
    return !data || data.length === 0;
  } catch (error) {
    console.log(`    ⚠️  Error in shouldRefreshData: ${error.message}`);
    return true; // Refresh on error
  }
}

/**
 * Collect vendors for a specific city/category combination
 */
async function collectVendorsForCityCategory(city, category) {
  const searchQuery = `wedding ${category.slug.replace(/-/g, ' ')} ${city.name} ${city.stateCode}`;
  
  try {
    // Call DataForSEO API
    const apiResult = await callDataForSeoApi(searchQuery);
    
    if (!apiResult.success) {
      throw new Error(`API call failed: ${apiResult.error}`);
    }
    
    // Transform and validate data
    const vendors = transformGoogleMapsData(apiResult.data, city, category);
    
    // Filter for wedding-related businesses
    const weddingVendors = vendors.filter(vendor => isWeddingVendor(vendor, category));
    
    // Insert/update vendors in database
    let insertedCount = 0;
    if (!CONFIG.dryRun && weddingVendors.length > 0) {
      insertedCount = await insertVendors(weddingVendors);
    }
    
    return {
      vendorsCollected: CONFIG.dryRun ? weddingVendors.length : insertedCount,
      apiCalls: 1,
      apiCost: apiResult.cost || 0
    };
    
  } catch (error) {
    console.error(`    ❌ Error collecting vendors: ${error.message}`);
    throw error;
  }
}

/**
 * Call DataForSEO Google Maps API
 */
async function callDataForSeoApi(searchQuery) {
  try {
    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
    
    const requestBody = [{
      keyword: searchQuery,
      location_code: 2840, // United States
      language_code: "en",
      device: "desktop",
      os: "windows",
      depth: CONFIG.maxResultsPerQuery
    }];
    
    console.log(`    🔍 API Query: "${searchQuery}"`);
    
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status_code !== 20000) {
      throw new Error(`API returned error: ${data.status_message}`);
    }
    
    const results = data.tasks?.[0]?.result?.[0]?.items || [];
    const cost = data.cost || 0;
    
    console.log(`    📊 API returned ${results.length} results (cost: $${cost})`);
    
    return {
      success: true,
      data: results,
      cost: cost
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
}

/**
 * Transform Google Maps API data to our database schema
 */
function transformGoogleMapsData(googleResults, city, category) {
  return googleResults.map(result => {
    // Parse rating
    let rating = null;
    if (result.rating && result.rating.value) {
      rating = {
        value: result.rating.value,
        rating_type: "Max5",
        votes_count: result.rating.votes_count || 0,
        rating_max: 5,
        count: result.rating.votes_count || 0
      };
    }
    
    // Get state code
    const stateCode = STATE_ABBREVIATIONS[city.state] || city.stateCode;
    
    return {
      place_id: result.place_id,
      business_name: result.title || 'Unknown Business',
      category: category.slug,
      city: city.name,
      state: city.state,
      state_code: stateCode,
      address: result.address,
      phone: result.phone,
      website_url: result.website,
      email: result.email,
      rating: rating,
      description: result.description || result.address,
      images: result.images || [],
      business_hours: result.work_hours,
      price_range: result.price_range || '$$-$$$',
      latitude: result.latitude,
      longitude: result.longitude,
      coordinates: result.latitude && result.longitude ? `(${result.longitude},${result.latitude})` : null,
      reviews_count: result.rating?.votes_count || 0,
      year_established: result.year_established,
      payment_methods: result.payment_methods || [],
      service_area: [city.name, city.state],
      categories: result.categories || [category.name],
      postal_code: result.postal_code,
      data_source: 'google_maps'
    };
  });
}

/**
 * Check if a business is wedding-related
 */
function isWeddingVendor(vendor, category) {
  const businessName = (vendor.business_name || '').toLowerCase();
  const description = (vendor.description || '').toLowerCase();
  const combinedText = `${businessName} ${description}`;
  
  // Wedding-related keywords
  const weddingKeywords = [
    'wedding', 'bride', 'bridal', 'groom', 'marriage', 'nuptials',
    'ceremony', 'reception', 'engagement', 'matrimony'
  ];
  
  // Category-specific keywords
  const categoryKeywords = category.keywords.map(k => k.toLowerCase());
  
  // Check for wedding keywords
  const hasWeddingKeyword = weddingKeywords.some(keyword => 
    combinedText.includes(keyword)
  );
  
  // Check for category keywords
  const hasCategoryKeyword = categoryKeywords.some(keyword => 
    combinedText.includes(keyword)
  );
  
  // Must have either wedding keyword or strong category match
  return hasWeddingKeyword || hasCategoryKeyword;
}

/**
 * Insert vendors into the database
 */
async function insertVendors(vendors) {
  try {
    console.log(`    💾 Inserting ${vendors.length} vendors into database...`);
    
    // Process in smaller batches to avoid timeouts
    const batchSize = 20;
    let totalInserted = 0;
    
    for (let i = 0; i < vendors.length; i += batchSize) {
      const batch = vendors.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('vendors_google')
        .upsert(batch, {
          onConflict: 'place_id',
          ignoreDuplicates: false
        })
        .select('id');
      
      if (error) {
        console.error(`    ❌ Database error for batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        // Continue with other batches
      } else {
        totalInserted += data?.length || batch.length;
        console.log(`    ✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vendors.length/batchSize)}`);
      }
      
      // Small delay between batches
      if (i + batchSize < vendors.length) {
        await delay(200);
      }
    }
    
    return totalInserted;
  } catch (error) {
    console.error(`    ❌ Error inserting vendors:`, error.message);
    throw error;
  }
}

/**
 * Log execution summary for monitoring
 */
async function logExecutionSummary(summary) {
  try {
    // Create a simple log table entry (you may want to create a dedicated table for this)
    const logEntry = {
      script_name: 'monthly-vendor-refresh',
      execution_date: new Date().toISOString(),
      summary: summary,
      created_at: new Date().toISOString()
    };
    
    // For now, just log to console. You can create a dedicated logs table later.
    console.log('\n📝 Execution Summary:', JSON.stringify(logEntry, null, 2));
    
  } catch (error) {
    console.error('Error logging execution summary:', error.message);
  }
}

/**
 * Utility function to delay execution
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  CONFIG.dryRun = true;
  console.log('🧪 Running in DRY RUN mode - no data will be inserted');
}

if (args.includes('--help')) {
  console.log(`
Monthly Vendor Refresh Script

Usage: node scripts/data-collection/monthly-vendor-refresh.js [options]

Options:
  --dry-run    Run without inserting data (for testing)
  --help       Show this help message

Environment Variables Required:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  DATAFORSEO_LOGIN
  DATAFORSEO_PASSWORD
  `);
  process.exit(0);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
