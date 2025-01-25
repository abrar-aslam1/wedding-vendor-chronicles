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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to perform searches");
    }

    const { data: { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } } = await supabase
      .functions.invoke('get-secrets', {
        body: { secrets: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'] }
      });

    const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);
    
    console.log('Making API request to DataForSEO...');
    
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword,
        location_code: locationCode,
        language_code: "en",
        device: "desktop",
        os: "windows",
        depth: 10
      }])
    });

    const data = await response.json();
    console.log('Received response from DataForSEO:', data);
    
    // Store the search results with the user_id
    const { error } = await supabase
      .from('vendor_searches')
      .insert({
        keyword,
        location_code: locationCode,
        search_results: data,
        user_id: user.id  // Add the user_id here
      });

    if (error) {
      console.error('Error saving search results:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error searching vendors:', error);
    throw error;
  }
};