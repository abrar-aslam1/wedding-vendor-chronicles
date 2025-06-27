import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { locationCodes } from "../_shared/locationCodes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location, subcategory } = await req.json();
    console.log('Search request received:', { keyword, location, subcategory });
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters');
    }

    const [city, state] = location.split(',').map(part => part.trim());
    console.log('Parsed location:', { city, state });

    // Always use 2840 as location code
    const locationCode = 2840;
    console.log('Using fixed location code:', locationCode);

    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN');
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD');

    if (!dataForSeoLogin || !dataForSeoPassword) {
      console.error('DataForSEO credentials missing');
      throw new Error('DataForSEO credentials not configured');
    }

    const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`);
    // Include subcategory in the search query if provided, with more specific phrasing
    const searchQuery = subcategory 
      ? `${keyword} specializing in ${subcategory} in ${location}`
      : `${keyword} in ${location}`;
    
    console.log('Making DataForSEO request for:', searchQuery);

    const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword: searchQuery,
        language_code: "en",
        location_code: locationCode,
        device: "desktop",
        os: "windows",
        depth: 40, // Increased from 20 to get more results
        search_type: "maps",
        local_search: true
      }])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error response:', errorText);
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DataForSEO raw response:', JSON.stringify(data));

    if (!data?.tasks?.[0]?.result?.[0]?.items) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const items = data.tasks[0].result[0].items || [];
    console.log('Extracted items count:', items.length);
    
    // Transform the results to match our SearchResult type
    let searchResults = items.map(item => {
      // Extract business hours if available
      const businessHours = extractBusinessHours(item);
      
      // Extract reviews if available
      const reviews = extractReviews(item);
      
      // Extract service area if available
      const serviceArea = extractServiceArea(item);
      
      return {
        title: item.title || '',
        description: item.snippet || '',
        rating: item.rating ? {
          value: item.rating,
          votes_count: item.rating_votes_count
        } : undefined,
        phone: item.phone,
        address: item.address,
        url: item.website,
        place_id: item.place_id,
        main_image: item.main_image,
        images: item.images,
        snippet: item.snippet,
        // Add new fields for enhanced schema markup
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        business_hours: businessHours,
        price_range: extractPriceRange(item),
        payment_methods: item.payment_methods || undefined,
        service_area: serviceArea,
        categories: item.categories || undefined,
        reviews: reviews,
        year_established: item.year_established || undefined,
        email: item.email || undefined,
        city: extractCity(item),
        state: extractState(item),
        postal_code: extractPostalCode(item)
      };
    });
    
    // Helper functions to extract structured data
    function extractBusinessHours(item) {
      if (!item.work_hours) return undefined;
      
      try {
        // DataForSEO might provide hours in various formats
        // This is a simplified example - adjust based on actual data format
        const hours = [];
        const daysMap = {
          1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
          5: 'Friday', 6: 'Saturday', 7: 'Sunday'
        };
        
        if (typeof item.work_hours === 'string') {
          // Parse text format like "Mon-Fri: 9AM-5PM, Sat: 10AM-3PM"
          const parts = item.work_hours.split(',');
          parts.forEach(part => {
            const [days, times] = part.split(':').map(s => s.trim());
            if (days && times) {
              const [opens, closes] = times.split('-').map(s => s.trim());
              // Handle day ranges like "Mon-Fri"
              if (days.includes('-')) {
                const [startDay, endDay] = days.split('-');
                const startIdx = Object.values(daysMap).findIndex(d => d.startsWith(startDay));
                const endIdx = Object.values(daysMap).findIndex(d => d.startsWith(endDay));
                if (startIdx >= 0 && endIdx >= 0) {
                  for (let i = startIdx + 1; i <= endIdx + 1; i++) {
                    hours.push({ day: daysMap[i], opens, closes });
                  }
                }
              } else {
                // Single day
                const dayIdx = Object.values(daysMap).findIndex(d => d.startsWith(days));
                if (dayIdx >= 0) {
                  hours.push({ day: daysMap[dayIdx + 1], opens, closes });
                }
              }
            }
          });
        } else if (Array.isArray(item.work_hours)) {
          // Handle array format if provided
          item.work_hours.forEach(entry => {
            if (entry.day && entry.hours) {
              hours.push({
                day: daysMap[entry.day] || entry.day,
                opens: entry.hours.split('-')[0]?.trim(),
                closes: entry.hours.split('-')[1]?.trim()
              });
            }
          });
        }
        
        return hours.length > 0 ? hours : undefined;
      } catch (error) {
        console.error('Error parsing business hours:', error);
        return undefined;
      }
    }
    
    function extractReviews(item) {
      if (!item.reviews || !Array.isArray(item.reviews)) {
        // If no reviews array, try to create one from available data
        if (item.rating && item.rating_votes_count) {
          // Create a generic review if we have rating data but no specific reviews
          return [{
            author: 'Google User',
            text: `This ${keyword} has an average rating of ${item.rating} from ${item.rating_votes_count} reviews.`,
            rating: item.rating,
            date: new Date().toISOString().split('T')[0] // Today's date
          }];
        }
        return undefined;
      }
      
      try {
        return item.reviews.map(review => ({
          author: review.author || 'Anonymous',
          text: review.text || '',
          rating: review.rating || 5,
          date: review.date
        }));
      } catch (error) {
        console.error('Error parsing reviews:', error);
        return undefined;
      }
    }
    
    function extractServiceArea(item) {
      // Extract service area information if available
      if (item.service_area) return item.service_area;
      
      // If not directly available, try to infer from other fields
      const serviceArea = [];
      
      // Try to extract city and state from address
      if (item.address) {
        const cityStateMatch = item.address.match(/([^,]+),\s*([A-Z]{2})/);
        if (cityStateMatch) {
          const [_, extractedCity, extractedState] = cityStateMatch;
          if (extractedCity) serviceArea.push(extractedCity.trim());
          if (extractedState) serviceArea.push(extractedState.trim());
        }
      }
      
      // Add the search location as a fallback
      if (serviceArea.length === 0 && city && state) {
        serviceArea.push(city, state);
      }
      
      return serviceArea.length > 0 ? serviceArea : undefined;
    }
    
    function extractPriceRange(item) {
      // Extract price range if available
      if (item.price_range) return item.price_range;
      
      // If not available, try to infer from description or other fields
      if (item.snippet && item.snippet.includes('$')) {
        // Count dollar signs in snippet to estimate price range
        const dollarCount = (item.snippet.match(/\$/g) || []).length;
        if (dollarCount > 0) {
          return '$'.repeat(Math.min(dollarCount, 4));
        }
      }
      
      // Default price range for wedding vendors
      return '$$-$$$';
    }
    
    function extractCity(item) {
      // Try to extract city from address
      if (item.address) {
        const cityMatch = item.address.match(/([^,]+),\s*[A-Z]{2}/);
        if (cityMatch && cityMatch[1]) {
          return cityMatch[1].trim();
        }
      }
      
      // Fallback to search city
      return city || '';
    }
    
    function extractState(item) {
      // Try to extract state from address
      if (item.address) {
        const stateMatch = item.address.match(/,\s*([A-Z]{2})/);
        if (stateMatch && stateMatch[1]) {
          return stateMatch[1].trim();
        }
      }
      
      // Fallback to search state
      return state || '';
    }
    
    function extractPostalCode(item) {
      // Try to extract postal code from address
      if (item.address) {
        const zipMatch = item.address.match(/\b\d{5}(?:-\d{4})?\b/);
        if (zipMatch) {
          return zipMatch[0];
        }
      }
      
      return '';
    }

    console.log(`Transformed ${searchResults.length} results`);
    
    // Add Instagram vendors for all vendor categories
    let instagramResults = [];
    
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
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase credentials for Instagram vendor query');
          console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
          console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
          // Continue without Instagram results if credentials are missing
        } else {
          console.log('Supabase credentials found, proceeding with Instagram query...');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log(`Fetching Instagram vendors for category: ${instagramCategory}...`);
        
        // Build query for Instagram vendors
        let query = supabase
          .from('instagram_vendors')
          .select('*')
          .eq('category', instagramCategory);
        
        // Simplified location filtering - only use city and state columns since location column was removed
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
          
          // Location matching using only city and state columns
          const locationConditions = [
            `city.ilike.%${city}%`,
            `state.ilike.%${state}%`,
            `state.ilike.%${stateAbbr}%`,
            `state.ilike.%${stateFullName}%`
          ];
          
          query = query.or(locationConditions.join(','));
        }
        
        const { data: instagramVendors, error } = await query.limit(20);
        
        if (error) {
          console.error('Error fetching Instagram vendors:', error);
        } else if (instagramVendors && instagramVendors.length > 0) {
          console.log(`Found ${instagramVendors.length} Instagram vendors`);
          
          // Transform Instagram vendors to SearchResult format
          instagramResults = instagramVendors.map(vendor => {
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
          
          console.log(`Transformed ${instagramResults.length} Instagram vendors`);
        }
      } catch (error) {
        console.error('Error processing Instagram vendors:', error);
        // Continue without Instagram results if there's an error
      }
    }
    
    // Combine Google Maps results with Instagram results
    // Put Instagram results first as they're more wedding-focused
    const combinedResults = [...instagramResults, ...searchResults];
    console.log(`Combined results: ${combinedResults.length} total (${instagramResults.length} Instagram + ${searchResults.length} Google Maps)`);
    
    // Use combined results for further processing
    searchResults = combinedResults;
    
    // Enhanced filtering for subcategory if provided
    if (subcategory) {
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
        // For example, if searching for "Italian", also look for "pasta", "pizza", etc.
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
      // We'll still sort by relevance, so the most relevant will appear first
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
