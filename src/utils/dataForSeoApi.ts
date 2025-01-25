import { supabase } from "@/integrations/supabase/client";

export const locationCodes = {
  "Texas": {
    code: 2840,
    cities: {
      "Dallas": 1003735,
      "Houston": 1003811,
      "Austin": 1003550,
      "San Antonio": 1004100
    }
  },
  "California": {
    code: 2840,
    cities: {
      "Los Angeles": 1003910,
      "San Francisco": 1004109,
      "San Diego": 1004102,
      "Sacramento": 1004088
    }
  },
  "New York": {
    code: 2840,
    cities: {
      "New York City": 1003581,
      "Buffalo": 1003622,
      "Albany": 1003518,
      "Rochester": 1004074
    }
  },
  "Florida": {
    code: 2840,
    cities: {
      "Miami": 1003937,
      "Orlando": 1004004,
      "Tampa": 1004145,
      "Jacksonville": 1003846
    }
  }
};

export const searchVendors = async (keyword: string, locationCode: number) => {
  try {
    // First, check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      throw new Error("You must be logged in to perform searches");
    }

    // Format the search keyword to include location context
    const searchKeyword = `${keyword} in Dallas, TX`;
    
    console.log('Search parameters:', {
      keyword: searchKeyword,
      locationCode,
      formattedSearch: searchKeyword
    });
    
    // Get the secrets for DataForSEO
    const { data: { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD }, error: secretsError } = await supabase
      .functions.invoke('get-secrets', {
        body: { secrets: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'] }
      });

    if (secretsError || !DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      console.error('Error getting secrets:', secretsError);
      throw new Error("Failed to get API credentials");
    }

    const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);
    
    console.log('Making API request to DataForSEO with parameters:', {
      keyword: searchKeyword,
      location_code: 2840,
      location_coordinate: locationCode,
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
        location_code: 2840,
        location_coordinate: locationCode,
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

    const data = await response.json();
    console.log('Raw DataForSEO response:', JSON.stringify(data, null, 2));
    
    // Check if we have results
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
    
    // Save search to database
    const { error: insertError } = await supabase
      .from('vendor_searches')
      .insert({
        keyword: searchKeyword,
        location_code: locationCode,
        search_results: data.tasks?.[0]?.result?.[0]?.items || [],
        user_id: session.user.id
      });

    if (insertError) {
      console.error('Error saving search:', insertError);
    }
    
    return data;
  } catch (error) {
    console.error('Error in searchVendors:', error);
    throw error;
  }
};