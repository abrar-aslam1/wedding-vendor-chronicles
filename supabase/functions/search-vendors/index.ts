import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { locationCodes } from "../_shared/locationCodes.ts"

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
    console.log('Search request received:', { keyword, location })
    
    if (!keyword || !location) {
      throw new Error('Missing required parameters')
    }

    const [city, state] = location.split(',').map(part => part.trim())
    console.log('Parsed location:', { city, state })

    // Get location code from the mapping
    const stateData = locationCodes[state]
    if (!stateData) {
      throw new Error(`Invalid state: ${state}`)
    }
    
    const locationCode = stateData.cities[city]
    if (!locationCode) {
      throw new Error(`Invalid city: ${city} for state: ${state}`)
    }

    console.log('Using location code:', locationCode)

    const dataForSeoLogin = Deno.env.get('DATAFORSEO_LOGIN')
    const dataForSeoPassword = Deno.env.get('DATAFORSEO_PASSWORD')

    if (!dataForSeoLogin || !dataForSeoPassword) {
      console.error('DataForSEO credentials missing')
      throw new Error('DataForSEO credentials not configured')
    }

    const auth = btoa(`${dataForSeoLogin}:${dataForSeoPassword}`)
    const searchQuery = `${keyword} in ${location}`
    
    console.log('Making DataForSEO request for:', searchQuery)

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
        depth: 20,
        search_type: "maps",
        local_search: true
      }])
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DataForSEO API error response:', errorText)
      throw new Error(`DataForSEO API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('DataForSEO raw response:', JSON.stringify(data))

    if (!data?.tasks?.[0]?.result?.[0]?.items) {
      console.error('Unexpected API response structure:', data)
      throw new Error('Invalid API response structure')
    }

    const items = data.tasks[0].result[0].items || []
    console.log('Extracted items count:', items.length)
    
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

    console.log(`Transformed ${searchResults.length} results`)

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
    console.error('Error in search-vendors function:', error)
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