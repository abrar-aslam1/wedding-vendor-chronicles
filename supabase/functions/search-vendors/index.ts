import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keyword, location } = await req.json()
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters')
    }

    const dataForSeoUrl = 'https://api.dataforseo.com/v3/serp/google/maps/live/advanced'
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
        location_code: 2840,
        device: "desktop",
        search_type: "maps",
        local_search: true
      }])
    })

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`)
    }

    const data = await response.json()
    const items = data?.tasks?.[0]?.result?.[0]?.items || []
    
    // Transform the results to match our SearchResult type
    const searchResults = items.map(item => ({
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
    }))

    console.log(`Found ${searchResults.length} results`)

    return new Response(
      JSON.stringify(searchResults),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1209600' // 14 days cache
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