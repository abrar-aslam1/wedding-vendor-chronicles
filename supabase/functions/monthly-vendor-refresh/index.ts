import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Top wedding cities (Tier 1)
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
const STATE_ABBREVIATIONS: Record<string, string> = {
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

serve(async (req) => {
  // Generate unique request ID for tracking
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] ${timestamp} - Monthly vendor refresh started`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    if (!dataForSeoLogin || !dataForSeoPassword) {
      throw new Error('Missing DataForSEO credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body for configuration
    let config = {
      dryRun: false,
      maxCities: 5, // Limit for testing
      onlyRefreshOlderThan: 30
    };
    
    try {
      const body = await req.text();
      if (body) {
        const parsedConfig = JSON.parse(body);
        config = { ...config, ...parsedConfig };
      }
    } catch (e) {
      // Use default config if parsing fails
    }
    
    console.log(`[${requestId}] Configuration:`, config);
    
    const startTime = Date.now();
    let totalVendorsCollected = 0;
    let totalApiCalls = 0;
    let totalApiCost = 0;
    const errors: string[] = [];
    
    // Process cities (limit for Edge Function timeout)
    const citiesToProcess = TOP_WEDDING_CITIES.slice(0, config.maxCities);
    
    for (const city of citiesToProcess) {
      console.log(`[${requestId}] Processing ${city.name}, ${city.stateCode}`);
      
      for (const category of VENDOR_CATEGORIES) {
        try {
          // Check if we need to refresh this city/category combination
          const shouldRefresh = await shouldRefreshData(supabase, city, category, config.onlyRefreshOlderThan);
          if (!shouldRefresh) {
            console.log(`[${requestId}] Skipping ${category.name} in ${city.name} (data is fresh)`);
            continue;
          }
          
          // Collect vendors for this city/category
          const result = await collectVendorsForCityCategory(
            supabase, 
            city, 
            category, 
            dataForSeoLogin, 
            dataForSeoPassword,
            config.dryRun
          );
          
          totalVendorsCollected += result.vendorsCollected;
          totalApiCalls += result.apiCalls;
          totalApiCost += result.apiCost;
          
          console.log(`[${requestId}] Collected ${result.vendorsCollected} vendors for ${category.name} in ${city.name}`);
          
          // Small delay between categories
          await delay(500);
        } catch (error) {
          const errorMsg = `Error processing ${category.name} in ${city.name}: ${error.message}`;
          console.error(`[${requestId}] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
      // Delay between cities
      await delay(1000);
    }
    
    // Final summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    const summary = {
      requestId,
      duration,
      totalVendorsCollected,
      totalApiCalls,
      totalApiCost,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // Store first 5 errors
      citiesProcessed: citiesToProcess.length,
      categoriesProcessed: VENDOR_CATEGORIES.length,
      dryRun: config.dryRun
    };
    
    console.log(`[${requestId}] Monthly vendor refresh complete:`, summary);
    
    return new Response(
      JSON.stringify({
        success: true,
        summary
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error(`[${requestId}] Error in monthly vendor refresh:`, error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

/**
 * Check if we should refresh data for a city/category combination
 */
async function shouldRefreshData(supabase: any, city: any, category: any, onlyRefreshOlderThan: number): Promise<boolean> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - onlyRefreshOlderThan);
    
    const { data, error } = await supabase
      .from('vendors_google')
      .select('id, last_updated')
      .eq('city', city.name)
      .eq('state', city.state)
      .eq('category', category.slug)
      .gte('last_updated', cutoffDate.toISOString())
      .limit(1);
    
    if (error) {
      console.log(`Error checking refresh status: ${error.message}`);
      return true; // Refresh on error
    }
    
    // If we have recent data, skip refresh
    return !data || data.length === 0;
  } catch (error) {
    console.log(`Error in shouldRefreshData: ${error.message}`);
    return true; // Refresh on error
  }
}

/**
 * Collect vendors for a specific city/category combination
 */
async function collectVendorsForCityCategory(
  supabase: any, 
  city: any, 
  category: any, 
  dataForSeoLogin: string, 
  dataForSeoPassword: string,
  dryRun: boolean
) {
  const searchQuery = `wedding ${category.slug.replace(/-/g, ' ')} ${city.name} ${city.stateCode}`;
  
  try {
    // Call DataForSEO API
    const apiResult = await callDataForSeoApi(searchQuery, dataForSeoLogin, dataForSeoPassword);
    
    if (!apiResult.success) {
      throw new Error(`API call failed: ${apiResult.error}`);
    }
    
    // Transform and validate data
    const vendors = transformGoogleMapsData(apiResult.data, city, category);
    
    // Filter for wedding-related businesses
    const weddingVendors = vendors.filter(vendor => isWeddingVendor(vendor, category));
    
    // Insert/update vendors in database
    let insertedCount = 0;
    if (!dryRun && weddingVendors.length > 0) {
      insertedCount = await insertVendors(supabase, weddingVendors);
    }
    
    return {
      vendorsCollected: dryRun ? weddingVendors.length : insertedCount,
      apiCalls: 1,
      apiCost: apiResult.cost || 0
    };
    
  } catch (error) {
    console.error(`Error collecting vendors: ${error.message}`);
    throw error;
  }
}

/**
 * Call DataForSEO Google Maps API
 */
async function callDataForSeoApi(searchQuery: string, login: string, password: string) {
  try {
    const auth = btoa(`${login}:${password}`);
    
    const requestBody = [{
      keyword: searchQuery,
      location_code: 2840, // United States
      language_code: "en",
      device: "desktop",
      os: "windows",
      depth: 20 // Limit for Edge Function
    }];
    
    console.log(`API Query: "${searchQuery}"`);
    
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
    
    console.log(`API returned ${results.length} results (cost: $${cost})`);
    
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
function transformGoogleMapsData(googleResults: any[], city: any, category: any) {
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
function isWeddingVendor(vendor: any, category: any): boolean {
  const businessName = (vendor.business_name || '').toLowerCase();
  const description = (vendor.description || '').toLowerCase();
  const combinedText = `${businessName} ${description}`;
  
  // Wedding-related keywords
  const weddingKeywords = [
    'wedding', 'bride', 'bridal', 'groom', 'marriage', 'nuptials',
    'ceremony', 'reception', 'engagement', 'matrimony'
  ];
  
  // Category-specific keywords
  const categoryKeywords = category.keywords.map((k: string) => k.toLowerCase());
  
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
async function insertVendors(supabase: any, vendors: any[]): Promise<number> {
  try {
    console.log(`Inserting ${vendors.length} vendors into database...`);
    
    // Process in smaller batches to avoid timeouts
    const batchSize = 10; // Smaller for Edge Function
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
        console.error(`Database error for batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        // Continue with other batches
      } else {
        totalInserted += data?.length || batch.length;
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vendors.length/batchSize)}`);
      }
      
      // Small delay between batches
      if (i + batchSize < vendors.length) {
        await delay(200);
      }
    }
    
    return totalInserted;
  } catch (error) {
    console.error(`Error inserting vendors:`, error.message);
    throw error;
  }
}

/**
 * Utility function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
