import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SearchVendorsBody {
  keyword: string
  location: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get request body
    const { keyword, location } = await req.json() as SearchVendorsBody

    // Call DataForSEO API
    const dataForSeoUrl = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced'
    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN')
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD')

    if (!dataForSeoLogin || !dataForSeoPassword) {
      throw new Error('DataForSEO credentials not configured')
    }

    const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`)
    
    const searchQuery = `${keyword} in ${location}`
    console.log('Searching for:', searchQuery)

    const response = await fetch(dataForSeoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword: searchQuery,
        language_code: "en",
        location_code: 2840, // US
        device: "desktop"
      }])
    })

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('DataForSEO response:', JSON.stringify(data))

    // Process and return results
    const results = data.tasks?.[0]?.result?.[0]?.items || []
    
    // Map results to SearchResult type
    const searchResults = results.map((item: any) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      position: item.rank_absolute,
      domain: item.domain
    }))

    // Cache results in Supabase
    const { error: cacheError } = await supabaseClient
      .from('vendor_cache')
      .insert({
        category: keyword.toLowerCase(),
        city: location.split(',')[0].trim().toLowerCase(),
        state: location.split(',')[1]?.trim().toLowerCase(),
        search_results: searchResults
      })

    if (cacheError) {
      console.error('Cache error:', cacheError)
    }

    return new Response(
      JSON.stringify(searchResults),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})