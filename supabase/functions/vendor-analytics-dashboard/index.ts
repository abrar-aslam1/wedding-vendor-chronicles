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
    const { vendorId, dateRange = '30', subscriptionTier = 'free' } = await req.json()

    // Verify vendor exists and get subscription info
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        *,
        vendor_subscriptions (
          *,
          subscription_plans (*)
        )
      `)
      .eq('id', vendorId)
      .single()

    if (vendorError || !vendor) {
      throw new Error('Vendor not found')
    }

    // Determine actual subscription tier
    const actualTier = vendor.vendor_subscriptions?.[0]?.subscription_plans?.name?.toLowerCase() || 'free'
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(dateRange))

    // Get analytics summary data
    const { data: summaryData, error: summaryError } = await supabase
      .from('vendor_analytics_summary')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (summaryError) throw summaryError

    // Calculate totals
    const totals = summaryData.reduce((acc, day) => ({
      profile_views: acc.profile_views + (day.profile_views || 0),
      contact_clicks: acc.contact_clicks + (day.contact_clicks || 0),
      phone_reveals: acc.phone_reveals + (day.phone_reveals || 0),
      email_clicks: acc.email_clicks + (day.email_clicks || 0),
      website_clicks: acc.website_clicks + (day.website_clicks || 0),
      photo_views: acc.photo_views + (day.photo_views || 0),
      favorites_added: acc.favorites_added + (day.favorites_added || 0),
      search_impressions: acc.search_impressions + (day.search_impressions || 0)
    }), {
      profile_views: 0,
      contact_clicks: 0,
      phone_reveals: 0,
      email_clicks: 0,
      website_clicks: 0,
      photo_views: 0,
      favorites_added: 0,
      search_impressions: 0
    })

    // Base analytics available to all tiers
    let analyticsResponse = {
      success: true,
      vendor: {
        id: vendor.id,
        business_name: vendor.business_name,
        subscription_tier: actualTier
      },
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: parseInt(dateRange)
      },
      totals,
      basic_metrics: {
        profile_views: totals.profile_views,
        contact_clicks: totals.contact_clicks,
        conversion_rate: totals.profile_views > 0 ? 
          ((totals.contact_clicks / totals.profile_views) * 100).toFixed(2) : '0.00'
      }
    }

    // Enhanced analytics for Professional tier and above
    if (['professional', 'premium'].includes(actualTier)) {
      // Get hourly breakdown for better insights
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('vendor_analytics_events')
        .select('created_at, event_type, user_location, referrer')
        .eq('vendor_id', vendorId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (!hourlyError && hourlyData) {
        // Process hourly data
        const hourlyBreakdown = processHourlyData(hourlyData)
        const locationBreakdown = processLocationData(hourlyData)
        const referrerBreakdown = processReferrerData(hourlyData)

        analyticsResponse = {
          ...analyticsResponse,
          professional_metrics: {
            daily_breakdown: summaryData,
            hourly_breakdown: hourlyBreakdown,
            location_breakdown: locationBreakdown,
            referrer_breakdown: referrerBreakdown,
            peak_hours: findPeakHours(hourlyBreakdown),
            engagement_rate: calculateEngagementRate(totals)
          }
        }
      }
    }

    // Premium analytics for Premium tier
    if (actualTier === 'premium') {
      // Get competitor comparison data (mock for now)
      const competitorData = await getCompetitorComparison(vendor.category, vendor.city, vendor.state)
      
      // Get conversion funnel data
      const funnelData = calculateConversionFunnel(totals)
      
      // Get lead quality scoring
      const leadQuality = await calculateLeadQuality(vendorId, supabase)

      analyticsResponse = {
        ...analyticsResponse,
        premium_metrics: {
          competitor_comparison: competitorData,
          conversion_funnel: funnelData,
          lead_quality_score: leadQuality,
          roi_metrics: calculateROI(totals, vendor.vendor_subscriptions?.[0]?.subscription_plans?.price_monthly || 0),
          advanced_insights: generateAdvancedInsights(summaryData, totals)
        }
      }
    }

    return new Response(
      JSON.stringify(analyticsResponse),
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

function processHourlyData(events: any[]): any {
  const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    events: 0,
    profile_views: 0,
    contact_clicks: 0
  }))

  events.forEach(event => {
    const hour = new Date(event.created_at).getHours()
    hourlyBreakdown[hour].events++
    
    if (event.event_type === 'profile_view') {
      hourlyBreakdown[hour].profile_views++
    } else if (event.event_type === 'contact_click') {
      hourlyBreakdown[hour].contact_clicks++
    }
  })

  return hourlyBreakdown
}

function processLocationData(events: any[]): any {
  const locationMap = new Map()
  
  events.forEach(event => {
    if (event.user_location) {
      const location = event.user_location.city || 'Unknown'
      locationMap.set(location, (locationMap.get(location) || 0) + 1)
    }
  })

  return Array.from(locationMap.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function processReferrerData(events: any[]): any {
  const referrerMap = new Map()
  
  events.forEach(event => {
    const referrer = event.referrer || 'Direct'
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
  })

  return Array.from(referrerMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function findPeakHours(hourlyData: any[]): any {
  return hourlyData
    .sort((a, b) => b.events - a.events)
    .slice(0, 3)
    .map(hour => ({
      hour: hour.hour,
      events: hour.events,
      time_range: `${hour.hour}:00 - ${hour.hour + 1}:00`
    }))
}

function calculateEngagementRate(totals: any): string {
  const totalInteractions = totals.contact_clicks + totals.phone_reveals + 
                           totals.email_clicks + totals.website_clicks + totals.favorites_added
  
  return totals.profile_views > 0 ? 
    ((totalInteractions / totals.profile_views) * 100).toFixed(2) : '0.00'
}

async function getCompetitorComparison(category: string, city: string, state: string): Promise<any> {
  // Mock competitor data - in real implementation, this would aggregate data from similar vendors
  return {
    category_average: {
      profile_views: 150,
      contact_clicks: 12,
      conversion_rate: '8.0'
    },
    local_average: {
      profile_views: 120,
      contact_clicks: 10,
      conversion_rate: '8.3'
    },
    ranking: {
      in_category: Math.floor(Math.random() * 50) + 1,
      in_location: Math.floor(Math.random() * 20) + 1
    }
  }
}

function calculateConversionFunnel(totals: any): any {
  return {
    search_impressions: totals.search_impressions,
    profile_views: totals.profile_views,
    contact_actions: totals.contact_clicks + totals.phone_reveals + totals.email_clicks,
    favorites: totals.favorites_added,
    conversion_rates: {
      impression_to_view: totals.search_impressions > 0 ? 
        ((totals.profile_views / totals.search_impressions) * 100).toFixed(2) : '0.00',
      view_to_contact: totals.profile_views > 0 ? 
        (((totals.contact_clicks + totals.phone_reveals + totals.email_clicks) / totals.profile_views) * 100).toFixed(2) : '0.00'
    }
  }
}

async function calculateLeadQuality(vendorId: string, supabase: any): Promise<any> {
  // Mock lead quality calculation - would analyze user behavior patterns
  return {
    score: Math.floor(Math.random() * 40) + 60, // 60-100 range
    factors: {
      engagement_depth: 'High',
      time_on_profile: 'Medium',
      repeat_visitors: 'Low',
      conversion_likelihood: 'High'
    }
  }
}

function calculateROI(totals: any, monthlyPrice: number): any {
  const estimatedLeadValue = 500 // Average wedding vendor lead value
  const estimatedLeads = Math.floor(totals.contact_clicks * 0.3) // 30% of contacts become leads
  const estimatedRevenue = estimatedLeads * estimatedLeadValue
  const monthlyCost = monthlyPrice / 100 // Convert from cents
  
  return {
    estimated_leads: estimatedLeads,
    estimated_revenue: estimatedRevenue,
    monthly_cost: monthlyCost,
    roi_percentage: monthlyCost > 0 ? 
      (((estimatedRevenue - monthlyCost) / monthlyCost) * 100).toFixed(2) : '0.00'
  }
}

function generateAdvancedInsights(dailyData: any[], totals: any): string[] {
  const insights = []
  
  // Trend analysis
  if (dailyData.length >= 7) {
    const recentWeek = dailyData.slice(-7)
    const previousWeek = dailyData.slice(-14, -7)
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.profile_views, 0) / 7
    const previousAvg = previousWeek.reduce((sum, day) => sum + day.profile_views, 0) / 7
    
    if (recentAvg > previousAvg * 1.1) {
      insights.push('Your profile views have increased by more than 10% this week!')
    } else if (recentAvg < previousAvg * 0.9) {
      insights.push('Your profile views have decreased this week. Consider updating your photos or description.')
    }
  }
  
  // Conversion rate insights
  const conversionRate = totals.profile_views > 0 ? (totals.contact_clicks / totals.profile_views) * 100 : 0
  if (conversionRate > 10) {
    insights.push('Excellent conversion rate! Your profile is highly engaging.')
  } else if (conversionRate < 5) {
    insights.push('Consider improving your profile description and photos to increase contact rates.')
  }
  
  return insights
}
