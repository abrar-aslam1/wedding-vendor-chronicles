import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NormalizedVendor {
  source: string
  ig_username: string
  ig_user_id?: string
  display_name: string
  bio?: string
  website_url?: string
  email?: string
  phone?: string
  category: string
  city: string
  state: string
  country: string
  followers?: number
  posts_count?: number
  profile_pic_url?: string
  external_urls?: string[]
  tags?: string[]
  has_contact?: boolean
  has_location?: boolean
}

interface IngestRequest {
  vendors: NormalizedVendor[]
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ingest-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('x-ingest-key')
    const expectedKey = Deno.env.get('INGEST_SHARED_KEY')
    
    if (!expectedKey) {
      console.error('INGEST_SHARED_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authHeader || authHeader !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { vendors }: IngestRequest = await req.json()

    if (!vendors || !Array.isArray(vendors)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: vendors array required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const results = []
    const errors = []

    for (const vendor of vendors) {
      try {
        // Validate required fields
        if (!vendor.ig_username || !vendor.display_name || !vendor.category || !vendor.city || !vendor.state) {
          errors.push({
            vendor: vendor.ig_username || 'unknown',
            error: 'Missing required fields'
          })
          continue
        }

        // Check if Instagram vendor already exists
        const { data: existing, error: checkError } = await supabase
          .from('instagram_vendors')
          .select('id, instagram_handle')
          .eq('instagram_handle', vendor.ig_username.toLowerCase())
          .eq('category', vendor.category)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing vendor:', checkError)
          errors.push({
            vendor: vendor.ig_username,
            error: 'Database check failed'
          })
          continue
        }

        // Prepare vendor data for insertion
        const vendorData = {
          instagram_handle: vendor.ig_username.toLowerCase(),
          business_name: vendor.display_name,
          bio: vendor.bio || null,
          category: vendor.category,
          city: vendor.city,
          state: vendor.state,
          location: vendor.has_location ? `${vendor.city}, ${vendor.state}` : null,
          website_url: vendor.website_url || null,
          phone: vendor.phone || null,
          email: vendor.email || null,
          follower_count: vendor.followers || null,
          posts_count: vendor.posts_count || null,
          profile_image_url: vendor.profile_pic_url || null,
          has_contact_info: vendor.has_contact || false,
          source: vendor.source,
          updated_at: new Date().toISOString()
        }

        if (existing) {
          // Update existing vendor
          const { data, error } = await supabase
            .from('instagram_vendors')
            .update(vendorData)
            .eq('id', existing.id)
            .select('id, instagram_handle')

          if (error) {
            console.error('Error updating vendor:', error)
            errors.push({
              vendor: vendor.ig_username,
              error: `Update failed: ${error.message}`
            })
          } else {
            results.push({
              vendor: vendor.ig_username,
              action: 'updated',
              id: data[0]?.id
            })
          }
        } else {
          // Insert new vendor
          const { data, error } = await supabase
            .from('instagram_vendors')
            .insert(vendorData)
            .select('id, instagram_handle')

          if (error) {
            console.error('Error inserting vendor:', error)
            errors.push({
              vendor: vendor.ig_username,
              error: `Insert failed: ${error.message}`
            })
          } else {
            results.push({
              vendor: vendor.ig_username,
              action: 'created',
              id: data[0]?.id
            })
          }
        }
      } catch (vendorError) {
        console.error('Error processing vendor:', vendorError)
        errors.push({
          vendor: vendor.ig_username || 'unknown',
          error: vendorError instanceof Error ? vendorError.message : 'Unknown error'
        })
      }
    }

    // Also update vendor_refresh table if it exists
    try {
      // Check if we need to update refresh schedules for successful vendors
      for (const result of results) {
        if (result.id) {
          const nextCheck = new Date()
          nextCheck.setDate(nextCheck.getDate() + 7) // Weekly refresh default

          await supabase
            .from('vendor_refresh')
            .upsert({
              vendor_id: result.id,
              vendor_type: 'instagram',
              last_updated: new Date().toISOString(),
              next_check_at: nextCheck.toISOString(),
              update_count: 1
            }, {
              onConflict: 'vendor_id,vendor_type'
            })
        }
      }
    } catch (refreshError) {
      console.warn('Error updating refresh schedules:', refreshError)
      // Don't fail the main operation for refresh schedule errors
    }

    const response = {
      success: true,
      processed: vendors.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log(`Instagram ingest completed: ${results.length} successful, ${errors.length} failed`)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Instagram ingest API error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
