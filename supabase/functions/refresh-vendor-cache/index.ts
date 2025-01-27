import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get expired cache entries
    const { data: expiredCaches, error: fetchError } = await supabase
      .from('vendor_cache')
      .select('*')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${expiredCaches?.length || 0} expired caches to refresh`)

    // Process each expired cache
    const refreshPromises = expiredCaches?.map(async (cache) => {
      try {
        const searchKeyword = `${cache.category} in ${cache.city}, ${cache.state}`
        
        // Get API credentials
        const { data: { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD }, error: secretsError } = await supabase
          .functions.invoke('get-secrets', {
            body: { secrets: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'] }
          })

        if (secretsError || !DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
          throw new Error('Failed to get API credentials')
        }

        // Make API request to DataForSEO
        const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)
        const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{
            keyword: searchKeyword,
            location_code: cache.location_code,
            language_code: "en",
            device: "desktop",
            os: "windows",
            depth: 20,
            search_type: "maps",
            local_search: true
          }])
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        const results = data?.tasks?.[0]?.result?.[0]?.items || []

        // Update cache with new results
        const { error: updateError } = await supabase
          .from('vendor_cache')
          .update({
            search_results: results,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', cache.id)

        if (updateError) {
          throw updateError
        }

        console.log(`Successfully refreshed cache for ${searchKeyword}`)
        return { success: true, category: cache.category, location: `${cache.city}, ${cache.state}` }
      } catch (error) {
        console.error(`Failed to refresh cache for ${cache.category} in ${cache.city}, ${cache.state}:`, error)
        return { success: false, error: error.message }
      }
    }) || []

    const results = await Promise.all(refreshPromises)
    
    return new Response(
      JSON.stringify({
        message: 'Cache refresh completed',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in refresh-vendor-cache:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})