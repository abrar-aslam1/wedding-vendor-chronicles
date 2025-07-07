import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] ${timestamp} - Google vendors search request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { keyword, location, subcategory, page = 1, limit = 30 } = requestBody;
    console.log(`[${requestId}] Raw request body:`, requestBody);
    console.log(`[${requestId}] Extracted parameters:`, { keyword, location, subcategory, page, limit });
    console.log(`[${requestId}] Subcategory type:`, typeof subcategory, `value: "${subcategory}"`);
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters: keyword and location');
    }

    const [city, state] = location.split(',').map(part => part.trim());
    console.log(`[${requestId}] Parsed location:`, { city, state });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate cache key
    const cacheKey = `${keyword.toLowerCase().trim()}|${location.toLowerCase().trim()}${subcategory ? '|' + subcategory.toLowerCase().trim() : ''}`;
    console.log(`[${requestId}] Cache key: ${cacheKey}`);

    // Check cache first - now with proper subcategory support
    console.log(`[${requestId}] Checking cache for subcategory: ${subcategory || 'none'}`);
    let cachedResult = null;
    
    try {
      let query = supabase
        .from('vendor_cache')
        .select('*')
        .eq('category', keyword)
        .eq('city', city)
        .eq('state', state)
        .gt('expires_at', new Date().toISOString());
      
      // Add subcategory filter if provided - CRITICAL: Must be exact match
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
        console.log(`[${requestId}] Looking for cache with EXACT subcategory: "${subcategory}"`);
      } else {
        query = query.is('subcategory', null);
        console.log(`[${requestId}] Looking for cache with no subcategory (null)`);
      }
      
      console.log(`[${requestId}] Cache query filters: category="${keyword}", city="${city}", state="${state}", subcategory="${subcategory || 'null'}"`);
      
      const { data: cacheData, error: cacheError } = await query.maybeSingle();
      
      if (cacheData && !cacheError) {
        cachedResult = cacheData;
        console.log(`[${requestId}] ✅ CACHE HIT: Found cached results from ${cachedResult.created_at}`);
        console.log(`[${requestId}] Cache entry subcategory: "${cacheData.subcategory || 'null'}" (looking for: "${subcategory || 'null'}")`);
        
        // Double-check subcategory match
        if (subcategory && cacheData.subcategory !== subcategory) {
          console.log(`[${requestId}] ⚠️ SUBCATEGORY MISMATCH: Found "${cacheData.subcategory}" but need "${subcategory}" - proceeding to API call`);
          cachedResult = null;
        } else if (!subcategory && cacheData.subcategory) {
          console.log(`[${requestId}] ⚠️ SUBCATEGORY MISMATCH: Found "${cacheData.subcategory}" but need null - proceeding to API call`);
          cachedResult = null;
        }
      } else {
        console.log(`[${requestId}] ❌ CACHE MISS: No cache found - error: ${cacheError?.message || 'none'}`);
      }
    } catch (error) {
      console.log(`[${requestId}] ❌ CACHE ERROR: ${error.message} - proceeding to API call`);
    }

    if (cachedResult && cachedResult.search_results) {
      const cachedGoogleResults = Array.isArray(cachedResult.search_results) ? cachedResult.search_results : [];
      console.log(`[${requestId}] Returning ${cachedGoogleResults.length} cached results`);
      
      return new Response(
        JSON.stringify({
          results: cachedGoogleResults,
          totalResults: cachedGoogleResults.length,
          hasMore: false,
          source: 'google_cached'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        }
      );
    }

    // Get DataForSEO credentials
    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
    
    if (!dataForSeoLogin || !dataForSeoPassword) {
      console.log(`[${requestId}] DataForSEO credentials not found, using fallback results`);
      console.log(`[${requestId}] DATAFORSEO_LOGIN: ${dataForSeoLogin ? 'SET' : 'NOT SET'}`);
      console.log(`[${requestId}] DATAFORSEO_PASSWORD: ${dataForSeoPassword ? 'SET' : 'NOT SET'}`);
      
      // Create fallback Google results that vary by subcategory
      const subcategoryPrefix = subcategory ? `${subcategory} ` : '';
      const subcategoryId = subcategory ? subcategory.replace(/\s+/g, '_').toLowerCase() : 'general';
      
      const fallbackResults = [
        {
          title: `${subcategoryPrefix}${keyword} in ${city}, ${state}`,
          description: `Professional ${subcategoryPrefix}${keyword} services in ${city}, ${state}`,
          rating: { value: 4.5, rating_type: "Max5", votes_count: 25, rating_max: 5, count: 25 },
          phone: '(555) 123-4567',
          address: `123 Main Street, ${city}, ${state}`,
          place_id: `fallback_google_${subcategoryId}_1`,
          main_image: undefined,
          images: [],
          snippet: `Top-rated ${subcategoryPrefix}${keyword} serving ${city} and surrounding areas`,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          business_hours: 'Mon-Fri 9AM-6PM',
          price_range: '$$-$$$',
          payment_methods: ['Credit Card', 'Cash'],
          service_area: [city, state],
          categories: subcategory ? [subcategory, keyword] : [keyword],
          reviews: 25,
          year_established: 2018,
          email: `contact@${subcategoryId}${keyword.replace(/\s+/g, '')}.com`,
          city: city,
          state: state,
          postal_code: '12345',
          vendor_source: 'google' as const
        },
        {
          title: `Elite ${subcategoryPrefix}${keyword} Services`,
          description: `Award-winning ${subcategoryPrefix}${keyword} specialists in ${city}`,
          rating: { value: 4.8, rating_type: "Max5", votes_count: 42, rating_max: 5, count: 42 },
          phone: '(555) 234-5678',
          address: `456 Oak Avenue, ${city}, ${state}`,
          place_id: `fallback_google_${subcategoryId}_2`,
          main_image: undefined,
          images: [],
          snippet: `Premium ${subcategoryPrefix}${keyword} with excellent reviews`,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          business_hours: 'Mon-Sat 8AM-7PM',
          price_range: '$$$',
          payment_methods: ['Credit Card', 'PayPal'],
          service_area: [city, state],
          categories: subcategory ? [subcategory, keyword] : [keyword],
          reviews: 42,
          year_established: 2015,
          email: `info@elite${subcategoryId}${keyword.replace(/\s+/g, '')}.com`,
          city: city,
          state: state,
          postal_code: '12346',
          vendor_source: 'google' as const
        }
      ];

      // Cache the fallback results too
      try {
        const cacheData: any = {
          category: keyword,
          city: city,
          state: state,
          location_code: 2840,
          search_results: fallbackResults,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days (1 month)
        };
        
        // Add subcategory if provided
        if (subcategory) {
          cacheData.subcategory = subcategory;
        }
        
        await supabase
          .from('vendor_cache')
          .insert(cacheData);
        console.log(`[${requestId}] Successfully cached fallback results with subcategory: ${subcategory || 'none'}`);
      } catch (cacheError) {
        console.error(`[${requestId}] Error caching fallback results:`, cacheError);
      }

      return new Response(
        JSON.stringify({
          results: fallbackResults,
          totalResults: fallbackResults.length,
          hasMore: false,
          source: 'google_fallback'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        }
      );
    }

    // Make DataForSEO API call
    console.log(`[${requestId}] Making DataForSEO API call...`);
    const apiStartTime = Date.now();
    
    const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`);
    // Include subcategory in the search query for more specific results
    let searchQuery;
    if (subcategory) {
      // For subcategories, put them first for better targeting
      searchQuery = `${subcategory} ${keyword} in ${city} ${state}`;
    } else {
      searchQuery = `${keyword} in ${city} ${state}`;
    }
    
    console.log(`[${requestId}] Search query: "${searchQuery}"`);
    console.log(`[${requestId}] Using subcategory: ${subcategory || 'none'}`);
    
    // Get location code
    let locationCode = 2840; // Default to United States
    try {
      const { data: cityLocation } = await supabase
        .from('dataforseo_locations')
        .select('location_code')
        .eq('location_name', city)
        .eq('state_name', state)
        .eq('location_type', 'city')
        .single();
      
      if (cityLocation) {
        locationCode = cityLocation.location_code;
        console.log(`[${requestId}] Found location code: ${locationCode}`);
      }
    } catch (error) {
      console.log(`[${requestId}] Using default location code: ${locationCode}`);
    }

        const apiRequestBody = [{
          keyword: searchQuery,
          location_code: locationCode,
          language_code: "en",
          device: "desktop",
          os: "windows",
          depth: 20
        }];

    const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    });

    const apiTime = Date.now() - apiStartTime;
    console.log(`[${requestId}] API call completed in ${apiTime}ms`);

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[${requestId}] API cost: $${data.cost || 0}`);

    if (!data.tasks || !data.tasks[0] || !data.tasks[0].result || !data.tasks[0].result[0] || !data.tasks[0].result[0].items) {
      console.log(`[${requestId}] No results from API`);
      return new Response(
        JSON.stringify({
          results: [],
          totalResults: 0,
          hasMore: false,
          source: 'google_api_empty'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const googleResults = data.tasks[0].result[0].items;
    console.log(`[${requestId}] Found ${googleResults.length} Google Maps results`);

    // Transform Google Maps results
    const transformedResults = googleResults.map((result: any) => {
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
        main_image: result.main_image || result.logo || result.profile_image,
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

    // Cache the results using the correct table structure with subcategory
    console.log(`[${requestId}] Attempting to cache ${transformedResults.length} results with subcategory: ${subcategory || 'none'}`);
    try {
      const cacheData: any = {
        category: keyword,
        city: city,
        state: state,
        location_code: locationCode,
        search_results: transformedResults,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days (1 month)
      };
      
      // Add subcategory if provided
      if (subcategory) {
        cacheData.subcategory = subcategory;
        console.log(`[${requestId}] Adding subcategory to cache data: "${subcategory}"`);
      }
      
      console.log(`[${requestId}] Cache data prepared:`, {
        category: cacheData.category,
        city: cacheData.city,
        state: cacheData.state,
        subcategory: cacheData.subcategory || 'null',
        resultsCount: cacheData.search_results?.length || 0
      });
      
      const { data: insertResult, error: insertError } = await supabase
        .from('vendor_cache')
        .insert(cacheData)
        .select('id, subcategory');
      
      if (insertError) {
        throw insertError;
      }
      
      console.log(`[${requestId}] Successfully cached results with ID: ${insertResult?.[0]?.id}, subcategory: ${insertResult?.[0]?.subcategory || 'null'}`);
    } catch (cacheError) {
      console.error(`[${requestId}] Error caching results:`, cacheError);
      console.error(`[${requestId}] Cache error details:`, {
        code: cacheError.code,
        message: cacheError.message,
        details: cacheError.details,
        hint: cacheError.hint
      });
      
      // If subcategory column doesn't exist, try without it
      if (subcategory && cacheError.message?.includes('subcategory')) {
        console.log(`[${requestId}] Retrying cache without subcategory column`);
        try {
          const { data: retryResult, error: retryError } = await supabase
            .from('vendor_cache')
            .insert({
              category: keyword,
              city: city,
              state: state,
              location_code: locationCode,
              search_results: transformedResults,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .select('id');
          
          if (retryError) {
            throw retryError;
          }
          
          console.log(`[${requestId}] Successfully cached results without subcategory, ID: ${retryResult?.[0]?.id}`);
        } catch (retryError) {
          console.error(`[${requestId}] Retry cache also failed:`, retryError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        results: transformedResults,
        totalResults: transformedResults.length,
        hasMore: false,
        source: 'google_api'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in search-google-vendors function:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        results: [],
        totalResults: 0
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
