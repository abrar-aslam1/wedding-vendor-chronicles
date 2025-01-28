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
        location_code: 2840,
        device: "desktop",
        limit: 20 // Limit results for faster response
      }])
    })

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`)
    }

    const data = await response.json()
    const results = data.tasks?.[0]?.result?.[0]?.items || []
    
    // Process results more efficiently
    const searchResults = results
      .slice(0, 20) // Ensure we only take top 20 results
      .map(item => ({
        title: item.title,
        description: item.description,
        url: item.url,
        position: item.rank_absolute,
        domain: item.domain
      }))

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