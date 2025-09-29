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

  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { keyword, location, subcategory } = body;
    
    console.log(`[${requestId}] Search parameters:`, { keyword, location, subcategory });
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters: keyword and location');
    }

    // Parse location
    const [city, state] = location.split(',').map((part: string) => part.trim());
    console.log(`[${requestId}] Parsed location:`, { city, state });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE');
    
    console.log(`[${requestId}] Environment check - URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${requestId}] Missing Supabase credentials`);
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search results array
    const searchResults: any[] = [];

    // Helper function to get vendor category
    const getVendorCategory = (keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      if (keywordLower.includes('coffee cart') || (keywordLower.includes('coffee') && keywordLower.includes('cart'))) return 'coffee-carts';
      if (keywordLower.includes('matcha cart') || (keywordLower.includes('matcha') && keywordLower.includes('cart'))) return 'matcha-carts';
      if (keywordLower.includes('cocktail cart') || keywordLower.includes('mobile bar') || (keywordLower.includes('cocktail') && keywordLower.includes('cart'))) return 'cocktail-carts';
      if (keywordLower.includes('dessert cart') || keywordLower.includes('ice cream cart') || (keywordLower.includes('dessert') && keywordLower.includes('cart'))) return 'dessert-carts';
      if (keywordLower.includes('flower cart') || (keywordLower.includes('flower') && keywordLower.includes('cart'))) return 'flower-carts';
      if (keywordLower.includes('champagne cart') || keywordLower.includes('prosecco cart') || (keywordLower.includes('champagne') && keywordLower.includes('cart'))) return 'champagne-carts';
      if (keywordLower.includes('photographer') || keywordLower.includes('photography') || keywordLower.includes('photo')) return 'photographers';
      if (keywordLower.includes('wedding planner') || keywordLower.includes('planner')) return 'wedding-planners';
      if (keywordLower.includes('videographer') || keywordLower.includes('videography') || keywordLower.includes('video')) return 'videographers';
      if (keywordLower.includes('florist') || keywordLower.includes('floral')) return 'florists';
      if (keywordLower.includes('caterer') || keywordLower.includes('catering')) return 'caterers';
      if (keywordLower.includes('venue')) return 'venues';
      return null;
    };

    const vendorCategory = getVendorCategory(keyword);
    console.log(`[${requestId}] Vendor category mapping: ${keyword} -> ${vendorCategory}`);

    // Search Instagram vendors
    console.log(`[${requestId}] Searching Instagram vendors...`);
    try {
      let instagramQuery = supabase
        .from('instagram_vendors')
        .select('*');

      if (vendorCategory) {
        instagramQuery = instagramQuery.eq('category', vendorCategory);
      } else {
        instagramQuery = instagramQuery.or(`bio.ilike.%${keyword}%,business_name.ilike.%${keyword}%`);
      }

      if (city && state) {
        instagramQuery = instagramQuery
          .ilike('city', `%${city}%`)
          .ilike('state', `%${state}%`);
      }

      const { data: instagramVendors, error: instagramError } = await instagramQuery.limit(20);
      
      if (instagramError) {
        console.error(`[${requestId}] Instagram query error:`, instagramError);
      } else if (instagramVendors && instagramVendors.length > 0) {
        console.log(`[${requestId}] Found ${instagramVendors.length} Instagram vendors`);
        
        const instagramResults = instagramVendors.map(vendor => ({
          title: vendor.business_name || vendor.instagram_handle,
          description: vendor.bio || `Wedding vendor on Instagram`,
          rating: undefined,
          phone: vendor.phone,
          address: `${vendor.city}, ${vendor.state}`,
          url: vendor.instagram_url || `https://instagram.com/${vendor.instagram_handle}`,
          place_id: `instagram_${vendor.id}`,
          main_image: vendor.profile_image_url,
          images: vendor.profile_image_url ? [vendor.profile_image_url] : [],
          city: vendor.city,
          state: vendor.state,
          instagram_handle: vendor.instagram_handle,
          follower_count: vendor.follower_count,
          vendor_source: 'instagram'
        }));
        
        searchResults.push(...instagramResults);
        console.log(`[${requestId}] Added ${instagramResults.length} Instagram results`);
      } else {
        console.log(`[${requestId}] No Instagram vendors found`);
      }
    } catch (error) {
      console.error(`[${requestId}] Error searching Instagram vendors:`, error);
    }

    // Search regular vendors table
    console.log(`[${requestId}] Searching regular vendors...`);
    try {
      let vendorQuery = supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved');

      if (vendorCategory) {
        vendorQuery = vendorQuery.eq('category', vendorCategory);
      } else {
        vendorQuery = vendorQuery.or(`business_name.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`);
      }

      if (city && state) {
        vendorQuery = vendorQuery
          .ilike('city', `%${city}%`)
          .ilike('state', `%${state}%`);
      }

      const { data: regularVendors, error: vendorError } = await vendorQuery.limit(20);

      if (vendorError) {
        console.error(`[${requestId}] Regular vendors query error:`, vendorError);
      } else if (regularVendors && regularVendors.length > 0) {
        console.log(`[${requestId}] Found ${regularVendors.length} regular vendors`);
        
        const regularResults = regularVendors.map(vendor => ({
          title: vendor.business_name,
          description: vendor.description || `${vendor.category} in ${vendor.city}, ${vendor.state}`,
          rating: vendor.rating,
          phone: vendor.phone,
          address: vendor.address,
          url: vendor.website,
          place_id: `vendor_${vendor.id}`,
          city: vendor.city,
          state: vendor.state,
          vendor_source: 'database'
        }));
        
        searchResults.push(...regularResults);
        console.log(`[${requestId}] Added ${regularResults.length} regular vendor results`);
      } else {
        console.log(`[${requestId}] No regular vendors found`);
      }
    } catch (error) {
      console.error(`[${requestId}] Error searching regular vendors:`, error);
    }

    // Search Google/DataForSEO vendors table
    console.log(`[${requestId}] Searching Google vendors...`);
    try {
      let googleQuery = supabase
        .from('vendors_google_business')
        .select('*');

      if (vendorCategory) {
        googleQuery = googleQuery.eq('category', vendorCategory);
      } else {
        googleQuery = googleQuery.or(`business_name.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`);
      }

      if (city && state) {
        googleQuery = googleQuery
          .ilike('city', `%${city}%`)
          .ilike('state', `%${state}%`);
      }

      const { data: googleVendors, error: googleError } = await googleQuery.limit(20);

      if (googleError) {
        console.error(`[${requestId}] Google vendors query error:`, googleError);
      } else if (googleVendors && googleVendors.length > 0) {
        console.log(`[${requestId}] Found ${googleVendors.length} Google vendors`);
        
        const googleResults = googleVendors.map(vendor => ({
          title: vendor.business_name,
          description: vendor.description || `${vendor.category} in ${vendor.city}, ${vendor.state}`,
          rating: vendor.rating,
          phone: vendor.phone,
          address: vendor.address,
          url: vendor.website,
          place_id: vendor.place_id,
          main_image: vendor.logo_url,
          images: vendor.photos || [],
          city: vendor.city,
          state: vendor.state,
          vendor_source: 'google'
        }));
        
        searchResults.push(...googleResults);
        console.log(`[${requestId}] Added ${googleResults.length} Google vendor results`);
      } else {
        console.log(`[${requestId}] No Google vendors found`);
      }
    } catch (error) {
      console.error(`[${requestId}] Error searching Google vendors:`, error);
    }

    console.log(`[${requestId}] Total search results: ${searchResults.length}`);
    
    // Return response
    const response = {
      results: searchResults,
      totalResults: searchResults.length,
      hasMore: false,
      source: 'mixed'
    };
    
    console.log(`[${requestId}] Returning response with ${searchResults.length} results`);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in search-vendors function:', error);
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
