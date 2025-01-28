import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

interface SearchVendorRequest {
  keyword: string;
  location: string;
}

interface DataForSEOTask {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  result: Array<{
    items: Array<{
      title: string;
      snippet: string;
      rating?: {
        value: number;
        votes_count: number;
      };
      phone_number?: string;
      address?: string;
      url?: string;
      place_id?: string;
      images?: string[];
    }>;
  }>;
}

interface DataForSEOResponse {
  tasks: DataForSEOTask[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { keyword, location } = await req.json() as SearchVendorRequest;

    // DataForSEO API credentials from environment variables
    const login = Deno.env.get('DATAFORSEO_LOGIN');
    const password = Deno.env.get('DATAFORSEO_PASSWORD');

    if (!login || !password) {
      throw new Error('DataForSEO credentials not configured');
    }

    // Construct the search query
    const searchQuery = `${keyword} in ${location}`;
    
    // Make request to DataForSEO API
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(login + ':' + password),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword: searchQuery,
        location_name: location,
        language_name: "English",
        device: "desktop",
        os: "windows"
      }])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json() as { tasks: DataForSEOTask[] };
    
    if (!data?.tasks?.[0]?.result?.[0]?.items) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process and transform the results
    const results = data.tasks[0].result[0].items.map(item => ({
      title: item.title,
      snippet: item.snippet,
      rating: item.rating,
      phone: item.phone_number,
      address: item.address,
      url: item.url,
      place_id: item.place_id,
      main_image: item.images?.[0]
    }));

    // Cache the results in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const [city, state] = location.split(', ');
      
      await supabase.from('vendor_cache').insert({
        category: keyword.toLowerCase(),
        city: city.toLowerCase(),
        state: state.toLowerCase(),
        search_results: results
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Search vendors error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});