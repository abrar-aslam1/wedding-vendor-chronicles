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
    
    // Search results array
    let searchResults = [];
    
    // 1. Search Instagram vendors first (they're more wedding-focused)
    console.log('Searching Instagram vendors...');
    
    // Map keyword to Instagram vendor category
    const getInstagramCategory = (keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      if (keywordLower.includes('photographer')) return 'photographers';
      if (keywordLower.includes('wedding planner') || keywordLower.includes('planner')) return 'wedding-planners';
      if (keywordLower.includes('videographer')) return 'videographers';
      if (keywordLower.includes('florist')) return 'florists';
      if (keywordLower.includes('caterer')) return 'caterers';
      if (keywordLower.includes('venue')) return 'venues';
      if (keywordLower.includes('dj') || keywordLower.includes('band')) return 'djs-and-bands';
      if (keywordLower.includes('cake')) return 'cake-designers';
      if (keywordLower.includes('bridal')) return 'bridal-shops';
      if (keywordLower.includes('makeup')) return 'makeup-artists';
      if (keywordLower.includes('hair')) return 'hair-stylists';
      return null;
    };
    
    const instagramCategory = getInstagramCategory(keyword);
    
    if (instagramCategory) {
      try {
        console.log(`Fetching Instagram vendors for category: ${instagramCategory}...`);
        
        // Build query for Instagram vendors
        let instagramQuery = supabase
          .from('instagram_vendors')
          .select('*')
          .eq('category', instagramCategory);
        
        // Location filtering for Instagram vendors
        if (city && state) {
          const stateAbbreviations: Record<string, string> = {
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
          
          // Get both full state name and abbreviation
          const stateAbbr = stateAbbreviations[state] || state;
          const stateFullName = Object.keys(stateAbbreviations).find(key => stateAbbreviations[key] === state) || state;
          
          // Location matching using city and state columns
          const stateConditions = [
            `state.ilike.%${state}%`,
            `state.ilike.%${stateAbbr}%`,
            `state.ilike.%${stateFullName}%`
          ];
          
          instagramQuery = instagramQuery
            .ilike('city', `%${city}%`)
            .or(stateConditions.join(','));
        }
        
        const { data: instagramVendors, error: instagramError } = await instagramQuery.limit(20);
        
        if (instagramError) {
          console.error('Error fetching Instagram vendors:', instagramError);
        } else if (instagramVendors && instagramVendors.length > 0) {
          console.log(`Found ${instagramVendors.length} Instagram vendors`);
          
          // Transform Instagram vendors to SearchResult format
          const instagramResults = instagramVendors.map(vendor => {
            // Get vendor type for description
            const getVendorType = (category: string) => {
              const categoryMap: Record<string, string> = {
                'photographers': 'photographer',
                'wedding-planners': 'wedding planner',
                'videographers': 'videographer',
                'florists': 'florist',
                'caterers': 'caterer',
                'venues': 'venue',
                'djs-and-bands': 'entertainment provider',
                'cake-designers': 'cake designer',
                'bridal-shops': 'bridal shop',
                'makeup-artists': 'makeup artist',
                'hair-stylists': 'hair stylist'
              };
              return categoryMap[category] || 'wedding vendor';
            };
            
            const vendorType = getVendorType(vendor.category);
            const categoryDisplay = vendor.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return {
              title: vendor.business_name || vendor.instagram_handle,
              description: vendor.bio || `Wedding ${vendorType} on Instagram with ${vendor.follower_count || 0} followers`,
              rating: undefined, // Instagram vendors don't have Google ratings
              phone: vendor.phone,
              address: vendor.location || `${vendor.city}, ${vendor.state}`,
              url: vendor.website_url,
              place_id: `instagram_${vendor.id}`, // Unique identifier for Instagram vendors
              main_image: vendor.profile_image_url,
              images: vendor.profile_image_url ? [vendor.profile_image_url] : [],
              snippet: vendor.bio,
              latitude: undefined,
              longitude: undefined,
              business_hours: undefined,
              price_range: '$$-$$$', // Default for wedding vendors
              payment_methods: undefined,
              service_area: [vendor.city, vendor.state].filter(Boolean),
              categories: [categoryDisplay],
              reviews: undefined,
              year_established: undefined,
              email: vendor.email,
              city: vendor.city,
              state: vendor.state,
              postal_code: undefined,
              // Instagram-specific fields
              instagram_handle: vendor.instagram_handle,
              follower_count: vendor.follower_count,
              post_count: vendor.post_count,
              is_verified: vendor.is_verified,
              is_business_account: vendor.is_business_account,
              bio: vendor.bio,
              profile_image_url: vendor.profile_image_url,
              vendor_source: 'instagram' as const
            };
          });
          
          searchResults.push(...instagramResults);
          console.log(`Added ${instagramResults.length} Instagram vendors to results`);
        }
      } catch (error) {
        console.error('Error processing Instagram vendors:', error);
        // Continue without Instagram results if there's an error
      }
    }
    
    // 2. Search regular vendors table
    console.log('Searching regular vendors...');
    
    try {
      // Map keyword to vendor category
      const getVendorCategory = (keyword: string) => {
        const keywordLower = keyword.toLowerCase();
        if (keywordLower.includes('photographer')) return 'photographers';
        if (keywordLower.includes('wedding planner') || keywordLower.includes('planner')) return 'wedding-planners';
        if (keywordLower.includes('videographer')) return 'videographers';
        if (keywordLower.includes('florist')) return 'florists';
        if (keywordLower.includes('caterer')) return 'caterers';
        if (keywordLower.includes('venue')) return 'venues';
        if (keywordLower.includes('dj') || keywordLower.includes('band')) return 'djs-and-bands';
        if (keywordLower.includes('cake')) return 'cake-designers';
        if (keywordLower.includes('bridal')) return 'bridal-shops';
        if (keywordLower.includes('makeup')) return 'makeup-artists';
        if (keywordLower.includes('hair')) return 'hair-stylists';
        return null;
      };
      
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
    
    // 3. Search Google Maps API with caching
    console.log('Searching Google Maps API with caching...');
    
    try {
      // Generate cache key
      const cacheKey = `${keyword.toLowerCase().trim()}|${location.toLowerCase().trim()}${subcategory ? '|' + subcategory.toLowerCase().trim() : ''}`;
      console.log(`[${requestId}] Cache key: ${cacheKey}`);
      
      // Check cache first - handle missing search_key column gracefully
      console.log(`[${requestId}] Checking cache for existing results...`);
      let cachedResult = null;
      let cacheError = null;
      
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
        
        // Get DataForSEO API credentials
        const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
        const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
        
        console.log(`[${requestId}] DataForSEO credentials check:`, {
          hasLogin: !!dataForSeoLogin,
          hasPassword: !!dataForSeoPassword,
          loginLength: dataForSeoLogin?.length || 0,
          passwordLength: dataForSeoPassword?.length || 0
        });
        
        if (dataForSeoLogin && dataForSeoPassword) {
          console.log(`[${requestId}] Making DataForSEO API request...`);
          
          // Construct search query
          const searchQuery = `${keyword} ${city} ${state}`;
          console.log('Search query:', searchQuery);
          
          // DataForSEO API request
          const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`);
          
          const requestBody = [{
            keyword: searchQuery,
            location_code: 2840, // United States
            language_code: "en",
            device: "desktop",
            os: "windows",
            depth: 20,
            search_places: true
          }];
          
          const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
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
                // Parse rating
                let rating = undefined;
                if (result.rating && result.rating.value) {
                  rating = {
                    value: {
                      rating_type: "Max5",
                      value: result.rating.value,
                      votes_count: result.rating.votes_count || 0,
                      rating_max: 5
                    }
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
          console.log('DataForSEO credentials not available, skipping Google Maps search');
        }
      }
    } catch (error) {
      console.error('Error fetching Google Maps results:', error);
    }
    
    console.log(`Total search results: ${searchResults.length}`);
    
    // Check if we need to expand Google search for better coverage
    const googleResults = searchResults.filter(result => result.vendor_source === 'google');
    const instagramResults = searchResults.filter(result => result.vendor_source === 'instagram');
    
    console.log(`Initial results: Google: ${googleResults.length}, Instagram: ${instagramResults.length}`);
    
    // If Google results are significantly fewer than Instagram OR if we have subcategory but no Google results, do a broader Google search
    if ((googleResults.length < 3 && instagramResults.length > 0) || (subcategory && googleResults.length === 0)) {
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
        } else if (dataForSeoLogin && dataForSeoPassword) {
          // Make broader API call if no cache
          console.log('Making broader DataForSEO API call...');
          
          const broaderSearchQuery = `${keyword} ${city} ${state}`;
          const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`);
          
          const broaderRequestBody = [{
            keyword: broaderSearchQuery,
            location_code: 2840,
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
                      value: {
                        rating_type: "Max5",
                        value: result.rating.value,
                        votes_count: result.rating.votes_count || 0,
                        rating_max: 5
                      }
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
                        value: {
                          rating_type: "Max5",
                          value: result.rating.value,
                          votes_count: result.rating.votes_count || 0,
                          rating_max: 5
                        }
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
      } catch (error) {
        console.error('Error in broader search:', error);
      }
    }
    
    // Enhanced filtering for subcategory if provided
    if (subcategory && searchResults.length > 0) {
      const subcategoryLower = subcategory.toLowerCase();
      
      // Separate results by source for different filtering strategies
      const allGoogleResults = searchResults.filter(result => result.vendor_source === 'google');
      const allInstagramResults = searchResults.filter(result => result.vendor_source === 'instagram');
      const databaseResults = searchResults.filter(result => result.vendor_source === 'database');
      
      console.log(`Pre-filtering: Google: ${allGoogleResults.length}, Instagram: ${allInstagramResults.length}, Database: ${databaseResults.length}`);
      
      // Calculate relevance score for each result
      const scoredResults = searchResults.map(result => {
        const titleLower = result.title.toLowerCase();
        const descriptionLower = (result.description || '').toLowerCase();
        const snippetLower = (result.snippet || '').toLowerCase();
        
        // Base score - start with 1 for Google results to ensure they're not completely filtered out
        let score = result.vendor_source === 'google' ? 1 : 0;
        
        // Title matches are most important
        if (titleLower.includes(subcategoryLower)) {
          score += 10;
          // Exact match or starts with the subcategory
          if (titleLower === subcategoryLower || 
              titleLower.startsWith(`${subcategoryLower} `) || 
              titleLower.includes(` ${subcategoryLower} `)) {
            score += 15;
          }
        }
        
        // Description matches
        if (descriptionLower.includes(subcategoryLower)) {
          score += 5;
          // Phrase matches rather than just word fragments
          if (descriptionLower.includes(` ${subcategoryLower} `)) {
            score += 3;
          }
        }
        
        // Snippet matches
        if (snippetLower.includes(subcategoryLower)) {
          score += 5;
          // Phrase matches rather than just word fragments
          if (snippetLower.includes(` ${subcategoryLower} `)) {
            score += 3;
          }
        }
        
        // Check for related terms based on subcategory
        const relatedTerms = getRelatedTerms(subcategoryLower);
        for (const term of relatedTerms) {
          if (titleLower.includes(term)) score += 3;
          if (descriptionLower.includes(term)) score += 2;
          if (snippetLower.includes(term)) score += 2;
        }
        
        // For photographers, give bonus points for wedding-related terms
        if (keyword.toLowerCase().includes('photographer')) {
          const weddingTerms = ['wedding', 'bride', 'groom', 'marriage', 'ceremony', 'reception'];
          for (const term of weddingTerms) {
            if (titleLower.includes(term) || descriptionLower.includes(term)) {
              score += 2;
            }
          }
        }
        
        return { ...result, relevanceScore: score };
      });
      
      // Sort by relevance score (highest first)
      scoredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      // More lenient filtering - include results with score > 0 (which includes all Google results)
      const filteredResults = scoredResults.filter(result => (result.relevanceScore || 0) > 0);
      
      // Ensure we maintain a good balance between sources
      const MIN_GOOGLE_RESULTS = Math.min(8, allGoogleResults.length); // At least 8 Google results if available
      
      let finalResults = filteredResults;
      
      // Count results by source in filtered results
      const filteredGoogle = filteredResults.filter(r => r.vendor_source === 'google');
      const filteredInstagram = filteredResults.filter(r => r.vendor_source === 'instagram');
      
      console.log(`After filtering: Google: ${filteredGoogle.length}, Instagram: ${filteredInstagram.length}`);
      
      // If we don't have enough Google results, add more with lower scores
      if (filteredGoogle.length < MIN_GOOGLE_RESULTS && allGoogleResults.length > filteredGoogle.length) {
        const additionalGoogle = allGoogleResults
          .filter(result => !filteredResults.some(fr => fr.place_id === result.place_id))
          .sort((a, b) => {
            // Sort by rating if available
            const aRating = a.rating?.value?.value || 0;
            const bRating = b.rating?.value?.value || 0;
            return bRating - aRating;
          })
          .slice(0, MIN_GOOGLE_RESULTS - filteredGoogle.length);
          
        finalResults = [...filteredResults, ...additionalGoogle];
        console.log(`Added ${additionalGoogle.length} additional Google results to maintain balance`);
      }
      
      // Log scoring information
      console.log(`Scored ${scoredResults.length} results for subcategory: ${subcategory}`);
      console.log(`Top 5 scores:`, scoredResults.slice(0, 5).map(r => ({ 
        title: r.title, 
        score: r.relevanceScore,
        source: r.vendor_source 
      })));
      
      console.log(`Final results: ${finalResults.length} total`);
      const finalGoogle = finalResults.filter(r => r.vendor_source === 'google');
      const finalInstagram = finalResults.filter(r => r.vendor_source === 'instagram');
      console.log(`Final breakdown: Google: ${finalGoogle.length}, Instagram: ${finalInstagram.length}`);
      
      // Remove the relevanceScore property before returning
      searchResults = finalResults.map(({ relevanceScore, ...rest }) => rest);
    }
    
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

    return new Response(
      JSON.stringify(searchResults),
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
