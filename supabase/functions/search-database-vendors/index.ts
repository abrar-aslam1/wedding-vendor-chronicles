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
  
  console.log(`[${requestId}] ${timestamp} - Database vendors search request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location, subcategory } = await req.json();
    console.log(`[${requestId}] Parameters:`, { keyword, location, subcategory });
    
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

    // Helper function to get vendor category (all wedding-related)
    const getVendorCategory = (keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      // Strip "wedding" prefix if present to avoid double-wedding in queries
      const cleanKeyword = keywordLower.replace(/^wedding\s+/, '');
      
      if (cleanKeyword.includes('photographer') || cleanKeyword.includes('photography') || cleanKeyword.includes('photo')) return 'photographers';
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

    // Search all database tables in parallel
    console.log(`[${requestId}] Executing parallel database queries...`);
    const queryStartTime = Date.now();

    const [googleDbResults, regularVendorResults] = await Promise.all([
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
          
          // Apply subcategory filter if provided
          if (subcategory) {
            query = query.eq('subcategory', subcategory);
            console.log(`[${requestId}] Applied subcategory filter to Google DB: ${subcategory}`);
          }
          
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
          }
          
          const { data, error } = await query.limit(30);
          
          if (error) {
            console.error(`[${requestId}] Google DB query error:`, error);
            return [];
          }
          
          console.log(`[${requestId}] Found ${data?.length || 0} Google DB vendors`);
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
            .select('*');
          
          if (vendorCategory) {
            query = query.eq('category', vendorCategory);
          } else {
            query = query.or(`business_name.ilike.%${keyword}%,category.ilike.%${keyword}%`);
          }
          
          // Apply subcategory filter if provided
          if (subcategory) {
            query = query.eq('subcategory', subcategory);
            console.log(`[${requestId}] Applied subcategory filter to vendors table: ${subcategory}`);
          }
          
          if (city && state) {
            query = query
              .ilike('city', `%${city}%`)
              .ilike('state', `%${state}%`);
          }
          
          const { data, error } = await query.limit(20);
          
          if (error) {
            console.error(`[${requestId}] Vendors query error:`, error);
            return [];
          }
          
          console.log(`[${requestId}] Found ${data?.length || 0} regular vendors`);
          return data || [];
        } catch (error) {
          console.error(`[${requestId}] Vendors query error:`, error);
          return [];
        }
      })()
    ]);

    const queryTime = Date.now() - queryStartTime;
    console.log(`[${requestId}] Database queries completed in ${queryTime}ms`);

    // Transform and combine results
    const allDatabaseResults = [
      // Transform Google database vendors
      ...googleDbResults.map(vendor => ({
        title: vendor.business_name,
        description: vendor.description,
        rating: vendor.rating ? {
          value: vendor.rating,
          rating_type: "Max5",
          votes_count: 0,
          rating_max: 5,
          count: 0
        } : undefined,
        phone: vendor.phone,
        address: vendor.address,
        url: vendor.website_url,
        place_id: vendor.place_id,
        main_image: vendor.images?.[0],
        images: vendor.images || [],
        snippet: vendor.description,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        business_hours: vendor.business_hours,
        price_range: vendor.price_range,
        payment_methods: vendor.payment_methods,
        service_area: [vendor.city, vendor.state],
        categories: [vendor.category],
        reviews: vendor.reviews_count,
        year_established: vendor.year_established,
        email: vendor.email,
        city: vendor.city,
        state: vendor.state,
        postal_code: vendor.postal_code,
        vendor_source: 'google_database' as const
      })),

      // Transform regular vendors
      ...regularVendorResults.map(vendor => {
        // Parse contact_info JSON
        const contactInfo = typeof vendor.contact_info === 'string' 
          ? JSON.parse(vendor.contact_info) 
          : vendor.contact_info;
        
        return {
          title: vendor.business_name,
          description: vendor.description || `${vendor.category} in ${vendor.city}, ${vendor.state}`,
          rating: vendor.rating ? {
            value: vendor.rating,
            rating_type: "Max5",
            votes_count: 0,
            rating_max: 5,
            count: 0
          } : undefined,
          phone: contactInfo?.phone,
          address: `${vendor.city}, ${vendor.state}`,
          url: contactInfo?.website,
          place_id: `vendor_${vendor.id}`,
          main_image: vendor.images?.[0],
          images: vendor.images || [],
          snippet: vendor.description || `Professional ${vendor.category} serving ${vendor.city} and surrounding areas`,
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
      })
    ];

    console.log(`[${requestId}] Combined database results: ${allDatabaseResults.length} total`);
    console.log(`[${requestId}] Breakdown: Google DB: ${googleDbResults.length}, Regular: ${regularVendorResults.length}`);

    return new Response(
      JSON.stringify({
        results: allDatabaseResults,
        totalResults: allDatabaseResults.length,
        source: 'database',
        queryTime
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minutes cache
        }
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in search-database-vendors function:`, error);
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
