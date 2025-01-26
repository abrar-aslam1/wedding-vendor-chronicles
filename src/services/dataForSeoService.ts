import { supabase } from "@/integrations/supabase/client";
import { DataForSEOResponse, SearchResult } from "@/types/search";
import { locationCodes } from "@/config/locations";

const US_LOCATION_CODE = 2840;

async function getApiCredentials() {
  const { data: { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD }, error: secretsError } = await supabase
    .functions.invoke('get-secrets', {
      body: { secrets: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'] }
    });

  if (secretsError || !DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('Error getting secrets:', secretsError);
    throw new Error("Failed to get API credentials");
  }

  return { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD };
}

async function checkCache(keyword: string, locationCode: number, city?: string, state?: string) {
  console.log('Checking cache for:', { keyword, locationCode, city, state });
  
  const now = new Date().toISOString();
  
  const query = supabase
    .from('vendor_cache')
    .select('*')
    .eq('category', keyword)
    .eq('location_code', locationCode)
    .gt('expires_at', now);

  if (city && state) {
    query.eq('city', city.toLowerCase()).eq('state', state.toLowerCase());
  }

  const { data: cachedData, error: cacheError } = await query.maybeSingle();

  if (cacheError) {
    console.error('Cache check error:', cacheError);
    return null;
  }

  console.log('Cache check result:', cachedData);
  return cachedData?.search_results as SearchResult[] | null;
}

async function saveToCache(keyword: string, locationCode: number, results: SearchResult[], city?: string, state?: string) {
  console.log('Saving to cache:', { keyword, locationCode, city, state, resultsCount: results.length });
  
  const { error: upsertError } = await supabase
    .from('vendor_cache')
    .upsert({
      category: keyword,
      location_code: locationCode,
      search_results: results,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      city: city?.toLowerCase() || null,
      state: state?.toLowerCase() || null
    }, {
      onConflict: 'category,city,state'
    });

  if (upsertError) {
    console.error('Cache save error:', upsertError);
  }
}

async function makeApiRequest(searchKeyword: string, locationCode: number) {
  console.log('Making API request:', { searchKeyword, locationCode });
  
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = await getApiCredentials();
  const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: searchKeyword,
      location_code: locationCode,
      language_code: "en",
      device: "desktop",
      os: "windows",
      depth: 20,
      search_type: "maps",
      local_search: true,
      use_device_location: false
    }])
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DataForSEO API error response:', errorText);
    throw new Error(`DataForSEO API error: ${response.statusText}`);
  }

  const data = await response.json() as DataForSEOResponse;
  console.log('API response:', data);
  return data;
}

export async function searchVendors(keyword: string, location: string, city?: string, state?: string) {
  console.log('Searching vendors:', { keyword, location, city, state });
  
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      throw new Error("You must be logged in to perform searches");
    }

    const searchKeyword = `${keyword} in ${location}`;
    
    const cachedResults = await checkCache(searchKeyword, US_LOCATION_CODE, city, state);
    if (cachedResults) {
      console.log('Using cached results');
      return {
        tasks: [{
          result: [{
            items: cachedResults
          }]
        }]
      };
    }
    
    const data = await makeApiRequest(searchKeyword, US_LOCATION_CODE);
    
    if (!data.tasks?.[0]?.result?.[0]?.items?.length) {
      console.log('No results found in API response');
      return data;
    }

    const searchResults = data.tasks?.[0]?.result?.[0]?.items || [];
    
    await saveToCache(searchKeyword, US_LOCATION_CODE, searchResults, city, state);
    
    const { error: saveError } = await supabase
      .from('vendor_searches')
      .insert({
        keyword: searchKeyword,
        location_code: US_LOCATION_CODE,
        search_results: searchResults,
        user_id: session.user.id
      });
      
    if (saveError) {
      console.error('Error saving search:', saveError);
    }
    
    return data;
  } catch (error) {
    console.error('Error in searchVendors:', error);
    throw error;
  }
}

export async function prefetchCurrentRouteData(category: string, city: string, state: string) {
  console.log('Prefetching data for current route:', { category, city, state });
  try {
    await searchVendors(category, `${city}, ${state}`, city, state);
  } catch (error) {
    console.error('Error prefetching data:', error);
  }
}

export async function prefetchAllCitiesData(category: string) {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (const [state, stateData] of Object.entries(locationCodes)) {
    for (const [city] of Object.entries(stateData.cities)) {
      try {
        console.log(`Prefetching data for ${category} in ${city}, ${state}`);
        
        // Check if we already have cached data
        const cachedResults = await checkCache(category, US_LOCATION_CODE, city, state);
        if (cachedResults) {
          console.log(`Cache exists for ${category} in ${city}, ${state}`);
          continue;
        }
        
        // If no cache, fetch and store the data
        await searchVendors(category, `${city}, ${state}`, city, state);
        
        // Add a delay to avoid rate limiting
        await delay(2000);
      } catch (error) {
        console.error(`Error prefetching data for ${city}, ${state}:`, error);
      }
    }
  }
}
