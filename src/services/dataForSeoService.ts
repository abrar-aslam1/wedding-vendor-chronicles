import { supabase } from "@/integrations/supabase/client";
import { DataForSEOResponse } from "@/types/search";

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

async function makeApiRequest(searchKeyword: string, locationCode: number) {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = await getApiCredentials();
  const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);

  console.log('Making API request to DataForSEO with parameters:', {
    keyword: searchKeyword,
    location_code: locationCode,
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

  return await response.json() as DataForSEOResponse;
}

async function saveSearchResults(keyword: string, locationCode: number, results: any, userId: string) {
  const { error: insertError } = await supabase
    .from('vendor_searches')
    .insert({
      keyword,
      location_code: locationCode,
      search_results: results,
      user_id: userId
    });

  if (insertError) {
    console.error('Error saving search:', insertError);
    throw new Error("Failed to save search results");
  }
}

export async function searchVendors(keyword: string, locationCode: number) {
  try {
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      throw new Error("You must be logged in to perform searches");
    }

    console.log('Search parameters:', {
      keyword,
      locationCode
    });
    
    const data = await makeApiRequest(keyword, locationCode);
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
    
    await saveSearchResults(keyword, locationCode, data.tasks?.[0]?.result?.[0]?.items || [], session.user.id);
    
    return data;
  } catch (error) {
    console.error('Error in searchVendors:', error);
    throw error;
  }
}