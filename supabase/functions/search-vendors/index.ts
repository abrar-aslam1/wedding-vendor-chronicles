import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Generate unique request ID for tracking
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] ${timestamp} - New request received`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);
  
  // Log all headers for debugging
  console.log(`[${requestId}] Headers:`);
  for (const [key, value] of req.headers.entries()) {
    // Mask sensitive auth tokens but show their presence
    if (key.toLowerCase() === 'authorization') {
      console.log(`[${requestId}]   ${key}: ${value ? `Bearer ${value.substring(0, 20)}...` : 'null'}`);
    } else {
      console.log(`[${requestId}]   ${key}: ${value}`);
    }
  }

  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log raw body before parsing
    const rawBody = await req.text();
    console.log(`[${requestId}] Raw body length: ${rawBody.length}`);
    console.log(`[${requestId}] Raw body: ${rawBody}`);
    
    // Parse JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
      console.log(`[${requestId}] Parsed JSON successfully:`, parsedBody);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }
    
    const { keyword, location, subcategory } = parsedBody;
    console.log(`[${requestId}] Extracted parameters:`, { keyword, location, subcategory });
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters');
    }

    const [city, state] = location.split(',').map(part => part.trim());
    console.log('Parsed location:', { city, state });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search results array with proper typing
    const searchResults: any[] = [];
    
    const { page = 1, limit = 30 } = parsedBody;
    const offset = (page - 1) * limit;
    
    // Helper function to get vendor category
    const getVendorCategory = (keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      // Enhanced photographer matching
      if (keywordLower.includes('photographer') || keywordLower.includes('photography') || keywordLower.includes('photo')) return 'photographers';
      if (keywordLower.includes('wedding planner') || keywordLower.includes('planner')) return 'wedding-planners';
      if (keywordLower.includes('videographer') || keywordLower.includes('videography') || keywordLower.includes('video')) return 'videographers';
      if (keywordLower.includes('florist') || keywordLower.includes('floral')) return 'florists';
      if (keywordLower.includes('caterer') || keywordLower.includes('catering')) return 'caterers';
      if (keywordLower.includes('venue')) return 'venues';
      if (keywordLower.includes('dj') || keywordLower.includes('band') || keywordLower.includes('music')) return 'djs-and-bands';
      if (keywordLower.includes('cake')) return 'cake-designers';
      if (keywordLower.includes('bridal')) return 'bridal-shops';
      if (keywordLower.includes('makeup')) return 'makeup-artists';
      if (keywordLower.includes('hair')) return 'hair-stylists';
      return null;
    };

    const vendorCategory = getVendorCategory(keyword);
    console.log(`[${requestId}] Vendor category mapping: ${keyword} -> ${vendorCategory}`);

    // Execute all database queries in parallel for better performance
    console.log(`[${requestId}] Executing parallel database queries...`);
    const queryStartTime = Date.now();

    const [instagramResults, googleDbResults, regularVendorResults] = await Promise.all([
      // Instagram vendors query
      (async () => {
        console.log(`[${requestId}] Instagram query: vendorCategory=${vendorCategory}`);
        
        // First, let's see what categories exist in the Instagram table
        try {
          const { data: categoryTest, error: categoryError } = await supabase
            .from('instagram_vendors')
            .select('category')
            .limit(10);
          
          if (categoryTest) {
            const uniqueCategories = [...new Set(categoryTest.map(v => v.category))];
            console.log(`[${requestId}] Available Instagram categories:`, uniqueCategories);
          }
        } catch (e) {
          console.log(`[${requestId}] Could not fetch Instagram categories:`, e);
        }
        
        if (!vendorCategory) {
          console.log(`[${requestId}] No vendor category for Instagram query`);
          return [];
        }
        
        try {
          let query = supabase
            .from('instagram_vendors')
            .select('*');
          
          // Enhanced category filtering for Instagram vendors
          if (vendorCategory) {
            // Try exact category match first
            query = query.eq('category', vendorCategory);
            console.log(`[${requestId}] Instagram query: Using exact category filter: ${vendorCategory}`);
          } else {
            // If no category mapping, search by bio/description
            query = query.or(`bio.ilike.%${keyword}%,business_name.ilike.%${keyword}%`);
            console.log(`[${requestId}] Instagram query: Using keyword search in bio/business_name: ${keyword}`);
          }
          
          // Apply location filters
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
            console.log(`[${requestId}] Instagram location filters: city ILIKE '%${city}%', state ILIKE '%${state}%'`);
          }
          
          const { data, error } = await query.limit(20);
          
          console.log(`[${requestId}] Instagram query result: ${data?.length || 0} vendors found, error:`, error);
          
          // If exact category match returned no results, try fallback search
          if ((!data || data.length === 0) && vendorCategory) {
            console.log(`[${requestId}] No exact category match, trying fallback search with bio/description`);
            
            let fallbackQuery = supabase
              .from('instagram_vendors')
              .select('*')
              .or(`bio.ilike.%${keyword}%,business_name.ilike.%${keyword}%,category.ilike.%${keyword}%`);
            
            if (city && state) {
              fallbackQuery = fallbackQuery
                .ilike('city', `%${city}%`)
                .ilike('state', `%${state}%`);
            }
            
            const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(20);
            console.log(`[${requestId}] Instagram fallback query result: ${fallbackData?.length || 0} vendors found, error:`, fallbackError);
            
            if (fallbackData && fallbackData.length > 0) {
              console.log(`[${requestId}] First Instagram fallback vendor:`, {
                id: fallbackData[0].id,
                category: fallbackData[0].category,
                city: fallbackData[0].city,
                state: fallbackData[0].state,
                bio: fallbackData[0].bio?.substring(0, 50) + '...'
              });
              return fallbackData;
            }
          }
          
          if (data && data.length > 0) {
            console.log(`[${requestId}] First Instagram vendor:`, {
              id: data[0].id,
              category: data[0].category,
              city: data[0].city,
              state: data[0].state
            });
          }
          
          return data || [];
        } catch (error) {
          console.error(`[${requestId}] Instagram query error:`, error);
          return [];
        }
      })(),

      // Google database vendors query
      (async () => {
        try {
          let query = supabase
            .from('vendors_google')
            .select('*');
          
          if (vendorCategory) {
            query = query.eq('category', vendorCategory);
          } else {
            query = query.or(`business_name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
          }
          
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
          }
          
          const { data } = await query.limit(30);
          return data || [];
        } catch (error) {
          console.error(`[${requestId}] Google DB query error:`, error);
          return [];
        }
      })(),

      // Regular vendors table query
      (async () => {
        try {
          let query = supabase
            .from('vendors')
            .select('*')
            .or(`business_name.ilike.%${keyword}%,category.ilike.%${keyword}%`);
          
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
          }
          
          const { data } = await query.limit(20);
          return data || [];
        } catch (error) {
          console.error(`[${requestId}] Vendors query error:`, error);
          return [];
        }
      })()
    ]);

    const queryTime = Date.now() - queryStartTime;
    console.log(`[${requestId}] Parallel queries completed in ${queryTime}ms`);
    console.log(`[${requestId}] Results: Instagram=${instagramResults.length}, GoogleDB=${googleDbResults.length}, Regular=${regularVendorResults.length}`);

    // Transform and combine results
    const allDatabaseResults = [
      // Transform Instagram vendors
      ...instagramResults.map(vendor => ({
        title: vendor.business_name || vendor.instagram_handle,
        description: vendor.bio || `Wedding vendor on Instagram`,
        rating: undefined,
        phone: vendor.phone,
        address: vendor.location || `${vendor.city}, ${vendor.state}`,
        url: vendor.website_url,
        place_id: `instagram_${vendor.id}`,
        main_image: vendor.profile_image_url,
        images: vendor.profile_image_url ? [vendor.profile_image_url] : [],
        city: vendor.city,
        state: vendor.state,
        instagram_handle: vendor.instagram_handle,
        follower_count: vendor.follower_count,
        vendor_source: 'instagram' as const
      })),

      // Transform Google database vendors
      ...googleDbResults.map(vendor => ({
        title: vendor.business_name,
        description: vendor.description,
        rating: vendor.rating,
        phone: vendor.phone,
        address: vendor.address,
        url: vendor.website_url,
        place_id: vendor.place_id,
        main_image: vendor.images?.[0],
        images: vendor.images || [],
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        city: vendor.city,
        state: vendor.state,
        vendor_source: 'google_database' as const
      })),

      // Transform regular vendors
      ...regularVendorResults.map(vendor => ({
        title: vendor.business_name,
        description: vendor.description || `${vendor.category} in ${vendor.city}, ${vendor.state}`,
        rating: vendor.rating,
        phone: vendor.phone,
        address: vendor.address,
        url: vendor.website,
        place_id: `vendor_${vendor.id}`,
        city: vendor.city,
        state: vendor.state,
        vendor_source: 'database' as const
      }))
    ];

    console.log(`[${requestId}] Combined database results: ${allDatabaseResults.length} total`);

    // Always include database results and continue with Google API call
    searchResults.push(...allDatabaseResults);
    console.log(`[${requestId}] Added ${allDatabaseResults.length} database results, continuing with Google API call`);
    
    // 3. Search regular vendors table
    console.log('Searching regular vendors...');
    
    try {
      const vendorCategory = getVendorCategory(keyword);
      
      // Build query for regular vendors
      let vendorQuery = supabase
        .from('vendors')
        .select('*');
      
      // Filter by category if we can map it
      if (vendorCategory) {
        vendorQuery = vendorQuery.eq('category', vendorCategory);
      } else {
        // If we can't map the category, search in business_name and description
        vendorQuery = vendorQuery.or(`business_name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      
      // Location filtering for regular vendors
      if (city && state) {
        vendorQuery = vendorQuery
          .ilike('city', `%${city}%`)
          .ilike('state', `%${state}%`);
      }
      
      const { data: regularVendors, error: vendorError } = await vendorQuery.limit(20);
      
      if (vendorError) {
        console.error('Error fetching regular vendors:', vendorError);
      } else if (regularVendors && regularVendors.length > 0) {
        console.log(`Found ${regularVendors.length} regular vendors`);
        
        // Transform regular vendors to SearchResult format
        const regularResults = regularVendors.map(vendor => {
          // Parse contact_info JSON
          const contactInfo = typeof vendor.contact_info === 'string' 
            ? JSON.parse(vendor.contact_info) 
            : vendor.contact_info;
          
          return {
            title: vendor.business_name,
            description: vendor.description,
            rating: undefined, // Regular vendors don't have ratings yet
            phone: contactInfo?.phone,
            address: `${vendor.city}, ${vendor.state}`,
            url: contactInfo?.website,
            place_id: `vendor_${vendor.id}`,
            main_image: vendor.images?.[0],
            images: vendor.images || [],
            snippet: vendor.description,
            latitude: undefined,
            longitude: undefined,
            business_hours: undefined,
            price_range: '$$-$$$',
            payment_methods: undefined,
            service_area: [vendor.city, vendor.state],
            categories: [vendor.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())],
            reviews: undefined,
            year_established: undefined,
            email: contactInfo?.email,
            city: vendor.city,
            state: vendor.state,
            postal_code: undefined,
            vendor_source: 'database' as const
          };
        });
        
        searchResults.push(...regularResults);
        console.log(`Added ${regularResults.length} regular vendors to results`);
      }
    } catch (error) {
      console.error('Error processing regular vendors:', error);
    }
    
    // 4. Search Google Maps API with caching
    console.log('Searching Google Maps API with caching...');
    
    try {
      // Generate cache key
      const cacheKey = `${keyword.toLowerCase().trim()}|${location.toLowerCase().trim()}${subcategory ? '|' + subcategory.toLowerCase().trim() : ''}`;
      console.log(`[${requestId}] Cache key: ${cacheKey}`);
      
      // Check cache first - try new cache table then fall back to old
      console.log(`[${requestId}] Checking cache for existing results...`);
      let cachedResult = null;
      let cacheError = null;
      
      // Try new cache table first
      try {
        const { data: newCacheData, error: newCacheError } = await supabase
          .from('dataforseo_search_cache')
          .select('*')
          .eq('search_key', cacheKey)
          .eq('is_successful', true)
          .gt('expires_at', new Date().toISOString())
          .single();
        
        if (newCacheData && !newCacheError) {
          cachedResult = newCacheData;
          console.log(`[${requestId}] Found results in new cache table`);
        }
      } catch (error) {
        console.log(`[${requestId}] New cache table not available`);
      }
      
      // Fall back to old cache table if needed
      if (!cachedResult) {
        try {
          const cacheQuery = await supabase
            .from('vendor_cache')
            .select('*')
            .eq('search_key', cacheKey)
            .gt('expires_at', new Date().toISOString())
            .single();
          
          cachedResult = cacheQuery.data;
          cacheError = cacheQuery.error;
        } catch (error) {
          console.log(`[${requestId}] Cache table might not exist or search_key column missing, proceeding without cache:`, error);
          // Try alternative cache lookup using individual fields
          try {
            const altCacheQuery = await supabase
              .from('vendor_cache')
              .select('*')
              .eq('keyword', keyword)
              .eq('location', location)
              .eq('subcategory', subcategory || null)
              .gt('expires_at', new Date().toISOString())
              .single();
            
            cachedResult = altCacheQuery.data;
            cacheError = altCacheQuery.error;
            console.log(`[${requestId}] Alternative cache lookup successful`);
          } catch (altError) {
            console.log(`[${requestId}] Alternative cache lookup also failed, proceeding to API call`);
          }
        }
      }
      
      if (cacheError && cacheError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.log(`[${requestId}] Cache lookup error (non-critical):`, cacheError.message);
      }
      
      if (cachedResult && cachedResult.results) {
        console.log(`[${requestId}] Found cached results! ${cachedResult.result_count} results from ${cachedResult.created_at}`);
        const cachedGoogleResults = Array.isArray(cachedResult.results) ? cachedResult.results : [];
        searchResults.push(...cachedGoogleResults);
        console.log(`[${requestId}] Added ${cachedGoogleResults.length} cached Google Maps results`);
      } else {
        console.log(`[${requestId}] No valid cache found, calling DataForSEO API...`);
        
        const apiStartTime = Date.now(); // Track API response time
        
        // Get DataForSEO credentials from environment
        const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
        const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
        
        if (!dataForSeoLogin || !dataForSeoPassword) {
          console.log(`[${requestId}] DataForSEO credentials not found in environment, skipping Google API call`);
          // Continue without Google results
        } else {
          console.log(`[${requestId}] Using DataForSEO credentials from environment`);
        }
        
        const dataForSeoAuth = dataForSeoLogin && dataForSeoPassword ? 
          btoa(`${dataForSeoLogin}:${dataForSeoPassword}`) : 
          'YWJyYXJAYW1hcm9zeXN0ZW1zLmNvbTo2OTA4NGQ4YzhkY2Y4MWNk'; // fallback
        
        console.log(`[${requestId}] Making DataForSEO Google Maps API request...`);
        
        // Construct search query
        const searchQuery = `${keyword} ${city} ${state}`;
        console.log('Search query:', searchQuery);
        
        // Get location code from database
        let locationCode = 2840; // Default to United States
        try {
          // Try to find specific city location code
          const { data: cityLocation } = await supabase
            .from('dataforseo_locations')
            .select('location_code')
            .eq('location_name', city)
            .eq('state_name', state)
            .eq('location_type', 'city')
            .single();
          
          if (cityLocation) {
            locationCode = cityLocation.location_code;
            console.log(`[${requestId}] Found city location code: ${locationCode} for ${city}, ${state}`);
          } else {
            // Try state level
            const { data: stateLocation } = await supabase
              .from('dataforseo_locations')
              .select('location_code')
              .eq('location_name', state)
              .eq('location_type', 'state')
              .single();
            
            if (stateLocation) {
              locationCode = stateLocation.location_code;
              console.log(`[${requestId}] Found state location code: ${locationCode} for ${state}`);
            }
          }
        } catch (error) {
          console.log(`[${requestId}] Could not find location code, using default US code:`, error);
        }
        
        // DataForSEO Google Maps API request
        const requestBody = [{
          keyword: searchQuery,
          location_code: locationCode,
          language_code: "en",
          device: "desktop",
          os: "windows",
          depth: 100
        }];
        
        // Only make API call if we have valid credentials
        if (dataForSeoLogin && dataForSeoPassword) {
          const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${dataForSeoAuth}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('DataForSEO API response status:', data.status_message);
            console.log(`[${requestId}] API cost: $${data.cost || 0}`);
            
            if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0] && data.tasks[0].result[0].items) {
              const googleResults = data.tasks[0].result[0].items;
              console.log(`Found ${googleResults.length} Google Maps results`);
              
              // Transform Google Maps results
              const transformedGoogleResults = googleResults.map((result: any) => {
                // Parse rating - fix structure to match TypeScript interface
                let rating = undefined;
                if (result.rating && result.rating.value) {
                  rating = {
                    value: result.rating.value,
                    rating_type: "Max5",
                    votes_count: result.rating.votes_count || 0,
                    rating_max: 5,
                    count: result.rating.votes_count || 0
                  };
                }
                
                return {
                  title: result.title,
                  description: result.description || result.address,
                  rating: rating,
                  phone: result.phone,
                  address: result.address,
                  place_id: result.place_id,
                  main_image: result.main_image,
                  images: result.images || [],
                  snippet: result.description || result.address,
                  latitude: result.latitude,
                  longitude: result.longitude,
                  business_hours: result.work_hours,
                  price_range: result.price_range || '$$-$$$',
                  payment_methods: result.payment_methods,
                  service_area: [city, state],
                  categories: result.categories || [keyword],
                  reviews: result.reviews_count,
                  year_established: result.year_established,
                  email: result.email,
                  city: city,
                  state: state,
                  postal_code: result.postal_code,
                  vendor_source: 'google' as const
                };
              });
              
              // Cache the results for future use
              console.log(`[${requestId}] Caching ${transformedGoogleResults.length} results...`);
              try {
                // Try new cache table first
                const cacheData = {
                  search_key: cacheKey,
                  keyword: keyword,
                  location_code: locationCode,
                  location_name: location,
                  subcategory: subcategory || null,
                  search_type: 'google_maps',
                  results: transformedGoogleResults,
                  result_count: transformedGoogleResults.length,
                  api_cost: data.cost || 0,
                  api_response_time: Date.now() - apiStartTime,
                  is_successful: true,
                  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                };
                
                const { error: newCacheError } = await supabase
                  .from('dataforseo_search_cache')
                  .insert(cacheData);
                
                if (newCacheError) {
                  console.log(`[${requestId}] New cache table not available, using old cache`);
                  // Fallback to old cache table
                  const { error: insertError } = await supabase
                    .from('vendor_cache')
                    .insert({
                      keyword: keyword,
                      location: location,
                      subcategory: subcategory || null,
                      results: transformedGoogleResults,
                      api_cost: data.cost || 0
                    });
                
                  if (insertError) {
                    console.error(`[${requestId}] Error caching results:`, insertError);
                  } else {
                    console.log(`[${requestId}] Successfully cached results`);
                  }
                }
              } catch (cacheInsertError) {
                console.error(`[${requestId}] Cache insert error:`, cacheInsertError);
              }
              
              searchResults.push(...transformedGoogleResults);
              console.log(`Added ${transformedGoogleResults.length} Google Maps results`);
            }
          } else {
            console.error('DataForSEO API error:', response.status, response.statusText);
          }
        } else {
          console.log(`[${requestId}] DataForSEO credentials not available, skipping Google API call`);
          // No fallback results - just continue with database results only
        }
      }
    } catch (error) {
      console.error('Error fetching Google Maps results:', error);
      // No fallback results - just log the error and continue with database results only
    }
    
    console.log(`Total search results: ${searchResults.length}`);
    
    // Check if we need to expand Google search for better coverage
    const googleResults = searchResults.filter(result => result.vendor_source === 'google');
    const googleDatabaseResults = searchResults.filter(result => result.vendor_source === 'google_database');
    const instagramResults = searchResults.filter(result => result.vendor_source === 'instagram');
    const databaseResults = searchResults.filter(result => result.vendor_source === 'database');
    
    console.log(`Initial results: Google API: ${googleResults.length}, Google DB: ${googleDatabaseResults.length}, Instagram: ${instagramResults.length}, Database: ${databaseResults.length}`);
    
    // Always do a broader Google search when we have subcategory and low Google results, or when we have subcategory at all
    if (subcategory || (googleResults.length + googleDatabaseResults.length < 5 && (instagramResults.length > 0 || databaseResults.length > 0))) {
      console.log('Google results are low, performing broader search...');
      
      try {
        // Generate broader cache key (without subcategory)
        const broaderCacheKey = `${keyword.toLowerCase().trim()}|${location.toLowerCase().trim()}`;
        console.log(`Broader cache key: ${broaderCacheKey}`);
        
        // Check cache for broader search
        let broaderCachedResult = null;
        try {
          const broaderCacheQuery = await supabase
            .from('vendor_cache')
            .select('*')
            .eq('search_key', broaderCacheKey)
            .gt('expires_at', new Date().toISOString())
            .single();
          
          broaderCachedResult = broaderCacheQuery.data;
        } catch (error) {
          // Try alternative cache lookup
          try {
            const altBroaderCacheQuery = await supabase
              .from('vendor_cache')
              .select('*')
              .eq('keyword', keyword)
              .eq('location', location)
              .is('subcategory', null)
              .gt('expires_at', new Date().toISOString())
              .single();
            
            broaderCachedResult = altBroaderCacheQuery.data;
          } catch (altError) {
            console.log('No broader cache found');
          }
        }
        
        if (broaderCachedResult && broaderCachedResult.results) {
          console.log(`Found broader cached results: ${broaderCachedResult.result_count} results`);
          const broaderGoogleResults = Array.isArray(broaderCachedResult.results) ? broaderCachedResult.results : [];
          
          // Add broader results that aren't already in our results
          const existingPlaceIds = new Set(searchResults.map(r => r.place_id));
          const newGoogleResults = broaderGoogleResults.filter(result => 
            !existingPlaceIds.has(result.place_id)
          ).slice(0, 10); // Limit to 10 additional results
          
          searchResults.push(...newGoogleResults);
          console.log(`Added ${newGoogleResults.length} broader Google results`);
        } else {
          // Get DataForSEO API credentials for broader search
          const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
          const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
          
          if (dataForSeoLogin && dataForSeoPassword) {
            // Make broader API call if no cache
            console.log('Making broader DataForSEO API call...');
            
            const broaderSearchQuery = `${keyword} ${city} ${state}`;
            const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`);
            
            // Get location code for broader search
            let broaderLocationCode = 2840; // Default to United States
            try {
              const { data: cityLocation } = await supabase
                .from('dataforseo_locations')
                .select('location_code')
                .eq('location_name', city)
                .eq('state_name', state)
                .eq('location_type', 'city')
                .single();
              
              if (cityLocation) {
                broaderLocationCode = cityLocation.location_code;
              }
            } catch (error) {
              console.log(`Using default location code for broader search: ${broaderLocationCode}`);
            }
            
            const broaderRequestBody = [{
              keyword: broaderSearchQuery,
              location_code: broaderLocationCode,
              language_code: "en",
              device: "desktop",
              os: "windows",
              depth: 20,
              search_places: true
            }];
            
            const broaderResponse = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(broaderRequestBody)
            });
            
            if (broaderResponse.ok) {
              const broaderData = await broaderResponse.json();
              console.log(`Broader API cost: $${broaderData.cost || 0}`);
              
              if (broaderData.tasks && broaderData.tasks[0] && broaderData.tasks[0].result && broaderData.tasks[0].result[0] && broaderData.tasks[0].result[0].items) {
                const broaderGoogleResults = broaderData.tasks[0].result[0].items;
                console.log(`Found ${broaderGoogleResults.length} broader Google Maps results`);
                
                // Transform and add broader results
                const existingPlaceIds = new Set(searchResults.map(r => r.place_id));
                const transformedBroaderResults = broaderGoogleResults
                  .filter(result => !existingPlaceIds.has(result.place_id))
                  .slice(0, 10)
                  .map((result: any) => {
                    let rating = undefined;
                    if (result.rating && result.rating.value) {
                      rating = {
                        value: result.rating.value,
                        rating_type: "Max5",
                        votes_count: result.rating.votes_count || 0,
                        rating_max: 5,
                        count: result.rating.votes_count || 0
                      };
                    }
                    
                    return {
                      title: result.title,
                      description: result.description || result.address,
                      rating: rating,
                      phone: result.phone,
                      address: result.address,
                      place_id: result.place_id,
                      main_image: result.main_image,
                      images: result.images || [],
                      snippet: result.description || result.address,
                      latitude: result.latitude,
                      longitude: result.longitude,
                      business_hours: result.work_hours,
                      price_range: result.price_range || '$$-$$$',
                      payment_methods: result.payment_methods,
                      service_area: [city, state],
                      categories: result.categories || [keyword],
                      reviews: result.reviews_count,
                      year_established: result.year_established,
                      email: result.email,
                      city: city,
                      state: state,
                      postal_code: result.postal_code,
                      vendor_source: 'google' as const
                    };
                  });
                
                searchResults.push(...transformedBroaderResults);
                console.log(`Added ${transformedBroaderResults.length} broader Google results from API`);
                
                // Cache the broader results
                try {
                  await supabase
                    .from('vendor_cache')
                    .insert({
                      keyword: keyword,
                      location: location,
                      subcategory: null,
                      results: broaderGoogleResults.map((result: any) => ({
                        title: result.title,
                        description: result.description || result.address,
                        rating: result.rating ? {
                          value: result.rating.value,
                          rating_type: "Max5",
                          votes_count: result.rating.votes_count || 0,
                          rating_max: 5,
                          count: result.rating.votes_count || 0
                        } : undefined,
                        phone: result.phone,
                        address: result.address,
                        place_id: result.place_id,
                        main_image: result.main_image,
                        images: result.images || [],
                        snippet: result.description || result.address,
                        latitude: result.latitude,
                        longitude: result.longitude,
                        business_hours: result.work_hours,
                        price_range: result.price_range || '$$-$$$',
                        payment_methods: result.payment_methods,
                        service_area: [city, state],
                        categories: result.categories || [keyword],
                        reviews: result.reviews_count,
                        year_established: result.year_established,
                        email: result.email,
                        city: city,
                        state: state,
                        postal_code: result.postal_code,
                        vendor_source: 'google' as const
                      })),
                      api_cost: broaderData.cost || 0
                    });
                  console.log('Successfully cached broader results');
                } catch (cacheError) {
                  console.error('Error caching broader results:', cacheError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in broader search:', error);
      }
    }
    
    // Skip subcategory filtering for now - just return all results
    console.log(`Skipping subcategory filtering. Total results: ${searchResults.length}`);
    const finalGoogleResults = searchResults.filter(result => result.vendor_source === 'google');
    const finalGoogleDatabaseResults = searchResults.filter(result => result.vendor_source === 'google_database');
    const finalInstagramResults = searchResults.filter(result => result.vendor_source === 'instagram');
    const finalDatabaseResults = searchResults.filter(result => result.vendor_source === 'database');
    console.log(`Final breakdown: Google API: ${finalGoogleResults.length}, Google DB: ${finalGoogleDatabaseResults.length}, Instagram: ${finalInstagramResults.length}, Database: ${finalDatabaseResults.length}`);
    
    // Helper function to get related terms for a subcategory
    function getRelatedTerms(subcategory: string): string[] {
      const relatedTermsMap: Record<string, string[]> = {
        // Cuisine types
        'italian': ['pasta', 'pizza', 'risotto', 'italian cuisine', 'italy'],
        'mexican': ['tacos', 'enchiladas', 'burritos', 'mexican cuisine', 'mexico'],
        'chinese': ['dim sum', 'stir fry', 'chinese cuisine', 'china'],
        'indian': ['curry', 'tandoori', 'indian cuisine', 'india'],
        'american': ['burgers', 'steaks', 'american cuisine', 'usa'],
        'mediterranean': ['greek', 'turkish', 'mediterranean cuisine'],
        'japanese': ['sushi', 'ramen', 'japanese cuisine', 'japan'],
        'thai': ['curry', 'pad thai', 'thai cuisine', 'thailand'],
        'french': ['pastries', 'french cuisine', 'france'],
        'spanish': ['paella', 'tapas', 'spanish cuisine', 'spain'],
        'middle eastern': ['falafel', 'hummus', 'middle eastern cuisine'],
        
        // Photographer types
        'traditional photography': ['formal portraits', 'posed', 'traditional'],
        'photojournalistic': ['candid', 'documentary', 'storytelling'],
        'fine art': ['artistic', 'editorial', 'creative'],
        'aerial photography': ['drone', 'aerial', 'birds eye'],
        'engagement specialists': ['engagement', 'pre-wedding', 'couples', 'proposal', 'engagement session', 'engagement photos', 'engagement photography'],
        
        // Planner types
        'full-service planning': ['full service', 'comprehensive', 'complete'],
        'day-of coordination': ['day of', 'coordinator', 'on the day'],
        'partial planning': ['partial', 'some aspects', 'specific services'],
        'destination wedding planning': ['destination', 'travel', 'abroad'],
        'cultural wedding specialists': ['cultural', 'traditional', 'specific culture'],
        
        // Florist types
        'modern arrangements': ['modern', 'contemporary', 'unique'],
        'classic/traditional': ['classic', 'traditional', 'timeless'],
        'rustic/bohemian': ['rustic', 'boho', 'wildflower', 'natural'],
        'minimalist': ['minimalist', 'simple', 'clean'],
        'luxury/extravagant': ['luxury', 'extravagant', 'high-end', 'opulent'],
        
        // Venue types
        'ballrooms': ['ballroom', 'banquet hall', 'indoor'],
        'barns & farms': ['barn', 'farm', 'rustic', 'countryside'],
        'beach/waterfront': ['beach', 'waterfront', 'ocean', 'lake', 'river'],
        'gardens & parks': ['garden', 'park', 'outdoor', 'nature'],
        'historic buildings': ['historic', 'heritage', 'old', 'landmark'],
        'hotels & resorts': ['hotel', 'resort', 'accommodation'],
        'wineries & vineyards': ['winery', 'vineyard', 'wine'],
        'industrial spaces': ['industrial', 'warehouse', 'loft', 'urban'],
        
        // Entertainment types
        'djs': ['dj', 'disc jockey', 'music'],
        'live bands': ['band', 'live music', 'musicians'],
        'solo musicians': ['solo', 'single', 'acoustic'],
        'orchestras': ['orchestra', 'classical', 'ensemble'],
        'cultural music specialists': ['cultural music', 'traditional music']
      };
      
      return relatedTermsMap[subcategory] || [];
    }

    // Return consistent response structure
    const finalResponse = {
      results: searchResults,
      totalResults: searchResults.length,
      hasMore: false, // No pagination for mixed results
      source: 'mixed',
      queryTime: Date.now() - queryStartTime
    };
    
    console.log(`[${requestId}] Final response: ${searchResults.length} total results`);
    const sourceCounts = searchResults.reduce((acc, r) => {
      acc[r.vendor_source || 'unknown'] = (acc[r.vendor_source || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`[${requestId}] Results by source:`, sourceCounts);
    
    return new Response(
      JSON.stringify(finalResponse),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1209600' // 14 days cache
        }
      }
    );
  } catch (error) {
    console.error('Error in search-vendors function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
