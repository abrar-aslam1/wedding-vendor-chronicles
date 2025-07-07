import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get vendor category
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

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] ${timestamp} - New request received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location, subcategory, page = 1, limit = 30 } = await req.json();
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters');
    }

    const [city, state] = location.split(',').map(part => part.trim());
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate cache key
    const cacheKey = `${keyword.toLowerCase().trim()}|${location.toLowerCase().trim()}${subcategory ? '|' + subcategory.toLowerCase().trim() : ''}`;
    
    // Check cache first (using Promise.all for parallel cache checks)
    const [newCacheResult, oldCacheResult] = await Promise.all([
      // Check new cache table
      supabase
        .from('dataforseo_search_cache')
        .select('*')
        .eq('search_key', cacheKey)
        .eq('is_successful', true)
        .gt('expires_at', new Date().toISOString())
        .single()
        .then(result => result.data)
        .catch(() => null),
      
      // Check old cache table
      supabase
        .from('vendor_cache')
        .select('*')
        .eq('search_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single()
        .then(result => result.data)
        .catch(() => null)
    ]);

    const cachedResult = newCacheResult || oldCacheResult;
    
    if (cachedResult?.results) {
      console.log(`[${requestId}] Cache hit! Returning ${cachedResult.result_count} cached results`);
      const paginatedResults = cachedResult.results.slice(offset, offset + limit);
      
      return new Response(
        JSON.stringify({
          results: paginatedResults,
          totalResults: cachedResult.result_count,
          hasMore: offset + limit < cachedResult.result_count,
          source: 'cache',
          page,
          limit
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300' // 5 minutes client cache
          }
        }
      );
    }

    // No cache hit - execute parallel database queries
    console.log(`[${requestId}] No cache hit. Executing parallel queries...`);
    
    const vendorCategory = getVendorCategory(keyword);
    const startTime = Date.now();

    // Execute all queries in parallel
    const [instagramResults, googleDbResults, regularVendorResults] = await Promise.all([
      // Instagram vendors query
      (async () => {
        if (!vendorCategory) return [];
        
        try {
          let query = supabase
            .from('instagram_vendors')
            .select('*')
            .eq('category', vendorCategory);
          
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
          }
          
          const { data } = await query.limit(20);
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

    const queryTime = Date.now() - startTime;
    console.log(`[${requestId}] Parallel queries completed in ${queryTime}ms`);
    console.log(`[${requestId}] Results: Instagram=${instagramResults.length}, GoogleDB=${googleDbResults.length}, Regular=${regularVendorResults.length}`);

    // Transform and combine results
    const allResults = [
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

    // If we have enough results from database, return them
    if (allResults.length >= 20) {
      console.log(`[${requestId}] Sufficient database results found. Skipping API call.`);
      
      // Apply pagination
      const paginatedResults = allResults.slice(offset, offset + limit);
      
      return new Response(
        JSON.stringify({
          results: paginatedResults,
          totalResults: allResults.length,
          hasMore: offset + limit < allResults.length,
          source: 'database',
          page,
          limit,
          queryTime
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

    // If not enough results, make DataForSEO API call
    console.log(`[${requestId}] Insufficient database results. Making API call...`);
    
    // Get location code
    const { data: locationData } = await supabase
      .from('location_metadata')
      .select('location_code')
      .eq('location_name', city)
      .eq('location_type', 'City')
      .single();

    const locationCode = locationData?.location_code || 2840; // Default to US

    // Make API call
    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');
    
    if (!dataForSeoLogin || !dataForSeoPassword) {
      throw new Error('DataForSEO credentials not configured');
    }

    const apiResponse = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${dataForSeoLogin}:${dataForSeoPassword}`),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword: `${keyword} ${city} ${state}`,
        location_code: locationCode,
        language_code: "en",
        device: "desktop",
        os: "windows",
        depth: 100
      }])
    });

    const apiData = await apiResponse.json();
    const apiResults = apiData?.tasks?.[0]?.result?.[0]?.items || [];
    
    // Transform API results
    const transformedApiResults = apiResults
      .filter(item => item.type === 'maps_search' && item.rating !== undefined)
      .map(item => ({
        title: item.title,
        description: item.description,
        rating: item.rating?.value || 0,
        phone: item.phone,
        address: item.address,
        url: item.url,
        place_id: item.place_id,
        main_image: item.main_image,
        city: city,
        state: state,
        vendor_source: 'dataforseo' as const
      }));

    // Combine all results
    const finalResults = [...allResults, ...transformedApiResults];
    
    // Cache the results asynchronously (don't wait)
    supabase
      .from('dataforseo_search_cache')
      .insert({
        search_key: cacheKey,
        keyword,
        location_code: locationCode,
        city,
        state,
        results: finalResults,
        result_count: finalResults.length,
        is_successful: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        api_response_time: Date.now() - startTime,
        api_cost: apiData?.cost || 0
      })
      .then(() => console.log(`[${requestId}] Results cached successfully`))
      .catch(error => console.error(`[${requestId}] Cache error:`, error));

    // Apply pagination
    const paginatedResults = finalResults.slice(offset, offset + limit);
    
    return new Response(
      JSON.stringify({
        results: paginatedResults,
        totalResults: finalResults.length,
        hasMore: offset + limit < finalResults.length,
        source: 'combined',
        page,
        limit,
        queryTime: Date.now() - startTime
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
    console.error(`[${requestId}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});