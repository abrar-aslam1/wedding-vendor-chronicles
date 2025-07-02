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
      
      // Check cache first
      console.log(`[${requestId}] Checking cache for existing results...`);
      const { data: cachedResult, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('*')
        .eq('search_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (cacheError && cacheError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error(`[${requestId}] Cache lookup error:`, cacheError);
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
    
    // Enhanced filtering for subcategory if provided
    if (subcategory && searchResults.length > 0) {
      const subcategoryLower = subcategory.toLowerCase();
      
      // Calculate relevance score for each result
      const scoredResults = searchResults.map(result => {
        const titleLower = result.title.toLowerCase();
        const descriptionLower = (result.description || '').toLowerCase();
        const snippetLower = (result.snippet || '').toLowerCase();
        
        // Base score
        let score = 0;
        
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
        
        return { ...result, relevanceScore: score };
      });
      
      // Sort by relevance score (highest first)
      scoredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      // Filter results, but with a very low threshold to include more businesses
      const filteredResults = scoredResults.filter(result => (result.relevanceScore || 0) > 0);
      
      // Ensure we have at least 5 results if possible
      const MIN_RESULTS = 5;
      let finalResults = filteredResults;
      
      if (filteredResults.length < MIN_RESULTS && scoredResults.length > filteredResults.length) {
        console.log(`Not enough filtered results (${filteredResults.length}), adding more to reach minimum ${MIN_RESULTS}`);
        // Add more results to reach the minimum, taking the highest scored ones first
        const additionalResults = scoredResults
          .filter(result => (result.relevanceScore || 0) === 0) // Get the ones we filtered out
          .sort((a, b) => {
            // If no relevance score, sort by rating if available
            if (a.rating && b.rating) {
              return (b.rating.value || 0) - (a.rating.value || 0);
            }
            return 0;
          })
          .slice(0, MIN_RESULTS - filteredResults.length);
          
        finalResults = [...filteredResults, ...additionalResults];
        console.log(`Added ${additionalResults.length} additional results to reach ${finalResults.length} total`);
      }
      
      // Log scoring information
      console.log(`Scored ${scoredResults.length} results for subcategory: ${subcategory}`);
      console.log(`Top 3 scores:`, scoredResults.slice(0, 3).map(r => ({ 
        title: r.title, 
        score: r.relevanceScore 
      })));
      
      // If we have filtered results, use them; otherwise fall back to all results
      if (finalResults.length > 0) {
        console.log(`Using ${finalResults.length} results for subcategory: ${subcategory}`);
        // Remove the relevanceScore property before returning
        searchResults = finalResults.map(({ relevanceScore, ...rest }) => rest);
      } else {
        console.log(`No results specifically matching subcategory: ${subcategory}, using all results`);
      }
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
        'engagement specialists': ['engagement', 'pre-wedding'],
        
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
