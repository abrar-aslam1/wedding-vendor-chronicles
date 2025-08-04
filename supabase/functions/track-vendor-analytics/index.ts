import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { 
      vendorId, 
      eventType, 
      eventData = {}, 
      userSessionId, 
      userLocation, 
      referrer,
      userAgent 
    } = await req.json()

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Track the analytics event
    const { data: analyticsEvent, error: trackError } = await supabase
      .from('vendor_analytics_events')
      .insert({
        vendor_id: vendorId,
        event_type: eventType,
        event_data: eventData,
        user_session_id: userSessionId,
        user_location: userLocation,
        referrer: referrer,
        user_agent: userAgent,
        ip_address: clientIP
      })
      .select()
      .single()

    if (trackError) throw trackError

    // Update daily summary in real-time for immediate dashboard updates
    const today = new Date().toISOString().split('T')[0]
    
    // Get current summary for today
    const { data: existingSummary, error: summaryError } = await supabase
      .from('vendor_analytics_summary')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('date', today)
      .single()

    if (summaryError && summaryError.code !== 'PGRST116') throw summaryError

    // Prepare update data based on event type
    const updateData: any = { updated_at: new Date().toISOString() }
    
    switch (eventType) {
      case 'profile_view':
        updateData.profile_views = (existingSummary?.profile_views || 0) + 1
        break
      case 'contact_click':
        updateData.contact_clicks = (existingSummary?.contact_clicks || 0) + 1
        break
      case 'phone_reveal':
        updateData.phone_reveals = (existingSummary?.phone_reveals || 0) + 1
        break
      case 'email_click':
        updateData.email_clicks = (existingSummary?.email_clicks || 0) + 1
        break
      case 'website_click':
        updateData.website_clicks = (existingSummary?.website_clicks || 0) + 1
        break
      case 'photo_view':
        updateData.photo_views = (existingSummary?.photo_views || 0) + 1
        break
      case 'favorite_added':
        updateData.favorites_added = (existingSummary?.favorites_added || 0) + 1
        break
      case 'search_impression':
        updateData.search_impressions = (existingSummary?.search_impressions || 0) + 1
        break
    }

    if (existingSummary) {
      // Update existing summary
      const { error: updateError } = await supabase
        .from('vendor_analytics_summary')
        .update(updateData)
        .eq('vendor_id', vendorId)
        .eq('date', today)

      if (updateError) throw updateError
    } else {
      // Create new summary record
      const newSummary = {
        vendor_id: vendorId,
        date: today,
        profile_views: 0,
        contact_clicks: 0,
        phone_reveals: 0,
        email_clicks: 0,
        website_clicks: 0,
        photo_views: 0,
        favorites_added: 0,
        search_impressions: 0,
        ...updateData
      }

      const { error: insertError } = await supabase
        .from('vendor_analytics_summary')
        .insert(newSummary)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analytics event tracked successfully',
        eventId: analyticsEvent.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Batch tracking endpoint for multiple events
serve(async (req) => {
  if (req.method === 'POST' && req.url.includes('/batch')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { events } = await req.json()

      if (!Array.isArray(events) || events.length === 0) {
        throw new Error('Events array is required')
      }

      // Get client IP address
      const clientIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'

      // Prepare events for batch insert
      const analyticsEvents = events.map(event => ({
        vendor_id: event.vendorId,
        event_type: event.eventType,
        event_data: event.eventData || {},
        user_session_id: event.userSessionId,
        user_location: event.userLocation,
        referrer: event.referrer,
        user_agent: event.userAgent,
        ip_address: clientIP
      }))

      // Batch insert events
      const { data: insertedEvents, error: batchError } = await supabase
        .from('vendor_analytics_events')
        .insert(analyticsEvents)
        .select()

      if (batchError) throw batchError

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${insertedEvents.length} analytics events tracked successfully`,
          events: insertedEvents
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  }
})
