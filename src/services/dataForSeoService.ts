import { supabase } from "@/integrations/supabase/client";
import { DataForSEOResponse, SearchResult } from "@/types/search";

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

async function checkCache(keyword: string, locationCode: number) {
  const now = new Date().toISOString();
  
  const { data: cachedData, error: cacheError } = await supabase
    .from('vendor_cache')
    .select('*')
    .eq('category', keyword)
    .eq('location_code', locationCode)
    .gt('expires_at', now)
    .maybeSingle();

  if (cacheError) {
    console.error('Cache check error:', cacheError);
    return null;
  }

  return cachedData?.search_results as SearchResult[] | null;
}

async function saveToCache(keyword: string, locationCode: number, results: SearchResult[]) {
  const { error: upsertError } = await supabase
    .from('vendor_cache')
    .upsert({
      category: keyword,
      location_code: locationCode,
      search_results: results as any,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
    }, {
      onConflict: 'category,location_code'
    });

  if (upsertError) {
    console.error('Cache save error:', upsertError);
  }
}

async function makeApiRequest(searchKeyword: string) {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = await getApiCredentials();
  const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);

  console.log('Making API request to DataForSEO with parameters:', {
    keyword: searchKeyword,
    location_code: US_LOCATION_CODE,
    language_code: "en"
  });

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: searchKeyword,
      location_code: US_LOCATION_CODE,
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

  return await response.json() as DataForSEOResponse;
}

export async function searchVendors(keyword: string) {
  try {
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      throw new Error("You must be logged in to perform searches");
    }

    // Format search keyword with location context
    const searchKeyword = `${keyword} in Dallas, TX`;
    
    console.log('Search parameters:', {
      keyword: searchKeyword,
      formattedSearch: searchKeyword
    });
    
    // Check cache first
    const cachedResults = await checkCache(searchKeyword, US_LOCATION_CODE);
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
    
    // If not in cache, make API request
    const data = await makeApiRequest(searchKeyword);
    console.log('Raw DataForSEO response:', JSON.stringify(data, null, 2));
    
    if (!data.tasks?.[0]?.result?.[0]?.items?.length) {
      console.log('No results found in response');
      console.log('Response structure:', {
        hasTasks: !!data.tasks,
        firstTask: data.tasks?.[0],
        hasResult: !!data.tasks?.[0]?.result,
        firstResult: data.tasks?.[0]?.result?.[0],
        items: data.tasks?.[0]?.result?.[0]?.items
      });
    }

    const searchResults = data.tasks?.[0]?.result?.[0]?.items || [];
    
    // Save results to cache
    await saveToCache(searchKeyword, US_LOCATION_CODE, searchResults);
    
    // Save search to user history
    const { error: saveError } = await supabase
      .from('vendor_searches')
      .insert({
        keyword: searchKeyword,
        location_code: US_LOCATION_CODE,
        search_results: searchResults as any,
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