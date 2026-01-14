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
  
  console.log(`[${requestId}] ${timestamp} - Instagram vendors search request`);

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

    // Map search keywords to Instagram vendor categories
    const getVendorCategory = (keyword: string) => {
      const keywordLower = keyword.toLowerCase();
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

    if (!vendorCategory) {
      console.log(`[${requestId}] No Instagram category mapping found for keyword: ${keyword}`);
      return new Response(
        JSON.stringify({
          results: [],
          totalResults: 0,
          message: `No Instagram vendors found for category: ${keyword}`
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Query Instagram vendors
    console.log(`[${requestId}] Querying Instagram vendors with subcategory: ${subcategory || 'none'}...`);
    
    let query = supabase
      .from('instagram_vendors')
      .select('*')
      .eq('category', vendorCategory);

    // Apply subcategory filter if provided
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
      console.log(`[${requestId}] Applied subcategory filter: ${subcategory}`);
    }

    // Apply location filters
    if (city && state) {
      query = query
        .ilike('city', `%${city}%`)
        .ilike('state', `%${state}%`);
      console.log(`[${requestId}] Applied location filters: city=${city}, state=${state}`);
    }

    const { data: instagramVendors, error } = await query.limit(20);
    
    console.log(`[${requestId}] Instagram query result:`, { 
      error, 
      dataCount: instagramVendors?.length || 0
    });

    if (error) {
      console.error(`[${requestId}] Instagram query error:`, error);
      throw error;
    }

    if (!instagramVendors || instagramVendors.length === 0) {
      console.log(`[${requestId}] No Instagram vendors found`);
      return new Response(
        JSON.stringify({
          results: [],
          totalResults: 0,
          message: `No Instagram ${vendorCategory} found in ${city}, ${state}`
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Transform Instagram vendors to SearchResult format
    const instagramResults = instagramVendors.map((vendor: any) => {
      const vendorType = vendor.category === 'photographers' ? 'photographer' :
                        vendor.category === 'wedding-planners' ? 'wedding planner' :
                        vendor.category === 'florists' ? 'florist' :
                        vendor.category === 'videographers' ? 'videographer' :
                        'wedding vendor';

      return {
        title: vendor.business_name || vendor.instagram_handle,
        description: vendor.bio || `Wedding ${vendorType} on Instagram with ${vendor.follower_count || 0} followers`,
        rating: undefined,
        phone: vendor.phone,
        address: vendor.location || `${vendor.city}, ${vendor.state}`,
        url: vendor.website_url,
        place_id: `instagram_${vendor.id}`,
        main_image: vendor.profile_image_url,
        images: vendor.profile_image_url ? [vendor.profile_image_url] : [],
        snippet: vendor.bio,
        latitude: undefined,
        longitude: undefined,
        business_hours: undefined,
        price_range: '$$-$$$',
        payment_methods: undefined,
        service_area: [vendor.city, vendor.state].filter(Boolean),
        categories: [vendor.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())],
        reviews: undefined,
        year_established: undefined,
        email: vendor.email,
        city: vendor.city,
        state: vendor.state,
        postal_code: undefined,
        instagram_handle: vendor.instagram_handle,
        instagram_url: vendor.instagram_url,
        follower_count: vendor.follower_count,
        post_count: vendor.post_count,
        is_verified: vendor.is_verified,
        is_business_account: vendor.is_business_account,
        bio: vendor.bio,
        profile_image_url: vendor.profile_image_url,
        vendor_source: 'instagram' as const
      };
    });

    console.log(`[${requestId}] Successfully transformed ${instagramResults.length} Instagram vendors`);

    return new Response(
      JSON.stringify({
        results: instagramResults,
        totalResults: instagramResults.length,
        source: 'instagram'
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
    console.error('Error in search-instagram-vendors function:', error);
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
