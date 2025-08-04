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
    const { action, vendorId, claimantEmail, claimantName, verificationMethod, documents } = await req.json()

    switch (action) {
      case 'submit-claim':
        // Check if business is already claimed
        const { data: existingVendor, error: vendorError } = await supabase
          .from('vendors')
          .select('claim_status, claimed_by')
          .eq('id', vendorId)
          .single()

        if (vendorError) throw vendorError

        if (existingVendor.claim_status === 'claimed') {
          throw new Error('This business has already been claimed')
        }

        // Check if there's already a pending claim
        const { data: existingClaim, error: claimError } = await supabase
          .from('business_claims')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('claim_status', 'pending')
          .single()

        if (existingClaim) {
          throw new Error('There is already a pending claim for this business')
        }

        // Create new claim
        const { data: newClaim, error: createError } = await supabase
          .from('business_claims')
          .insert({
            vendor_id: vendorId,
            claimant_email: claimantEmail,
            claimant_name: claimantName,
            verification_method: verificationMethod,
            verification_documents: documents || [],
            claim_status: 'pending'
          })
          .select()
          .single()

        if (createError) throw createError

        // Update vendor status to pending claim
        const { error: updateError } = await supabase
          .from('vendors')
          .update({ claim_status: 'pending_claim' })
          .eq('id', vendorId)

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Claim submitted successfully',
            claimId: newClaim.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-claim-status':
        // Get claim status for a vendor
        const { data: claimStatus, error: statusError } = await supabase
          .from('business_claims')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (statusError && statusError.code !== 'PGRST116') throw statusError

        return new Response(
          JSON.stringify({ 
            success: true, 
            claim: claimStatus || null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'search-businesses':
        // Search for businesses to claim
        const { searchTerm, city, state, category } = await req.json()
        
        let query = supabase
          .from('vendors')
          .select('id, business_name, city, state, category, claim_status, description')
          .eq('claim_status', 'unclaimed')

        if (searchTerm) {
          query = query.ilike('business_name', `%${searchTerm}%`)
        }
        if (city) {
          query = query.eq('city', city)
        }
        if (state) {
          query = query.eq('state', state)
        }
        if (category) {
          query = query.eq('category', category)
        }

        const { data: businesses, error: searchError } = await query
          .limit(20)

        if (searchError) throw searchError

        return new Response(
          JSON.stringify({ 
            success: true, 
            businesses: businesses || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'verify-website':
        // Verify website ownership using BrightData MCP
        const { websiteUrl, verificationCode } = await req.json()
        
        // This would integrate with BrightData MCP to scrape and verify
        // For now, return a mock verification
        const isVerified = await verifyWebsiteOwnership(websiteUrl, verificationCode)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            verified: isVerified,
            message: isVerified ? 'Website ownership verified' : 'Verification failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }
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

async function verifyWebsiteOwnership(websiteUrl: string, verificationCode: string): Promise<boolean> {
  try {
    // In a real implementation, this would use BrightData MCP to scrape the website
    // and look for the verification code in meta tags or a specific file
    
    // Mock verification logic
    const response = await fetch(websiteUrl)
    const html = await response.text()
    
    // Look for verification code in meta tags or HTML content
    const hasVerificationCode = html.includes(verificationCode) || 
                               html.includes(`<meta name="vendor-verification" content="${verificationCode}">`)
    
    return hasVerificationCode
  } catch (error) {
    console.error('Website verification error:', error)
    return false
  }
}
