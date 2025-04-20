import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    let searchResults = items.map(item => ({
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
      snippet: item.snippet
    }));

    console.log(`Transformed ${searchResults.length} results`);
    
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
