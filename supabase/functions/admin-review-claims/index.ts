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
    const { action, claimId, adminId, decision, notes, vendorAuthData } = await req.json()

    // Verify admin permissions
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single()

    if (adminError || !admin) {
      throw new Error('Unauthorized: Invalid admin credentials')
    }

    switch (action) {
      case 'get-pending-claims':
        // Get all pending claims with vendor details
        const { data: pendingClaims, error: claimsError } = await supabase
          .from('business_claims')
          .select(`
            *,
            vendors (
              id,
              business_name,
              city,
              state,
              category,
              description,
              contact_info,
              images
            )
          `)
          .eq('claim_status', 'pending')
          .order('created_at', { ascending: true })

        if (claimsError) throw claimsError

        return new Response(
          JSON.stringify({ 
            success: true, 
            claims: pendingClaims || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'review-claim':
        if (!['approved', 'rejected'].includes(decision)) {
          throw new Error('Decision must be either "approved" or "rejected"')
        }

        // Get the claim details
        const { data: claim, error: getClaimError } = await supabase
          .from('business_claims')
          .select('*, vendors(*)')
          .eq('id', claimId)
          .single()

        if (getClaimError || !claim) {
          throw new Error('Claim not found')
        }

        // Update claim status
        const { error: updateClaimError } = await supabase
          .from('business_claims')
          .update({
            claim_status: decision,
            admin_notes: notes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminId
          })
          .eq('id', claimId)

        if (updateClaimError) throw updateClaimError

        if (decision === 'approved') {
          // Create vendor auth account if provided
          let vendorAuthId = null
          if (vendorAuthData) {
            const hashedPassword = await hashPassword(vendorAuthData.password)
            const { data: newVendorAuth, error: authError } = await supabase
              .from('vendor_auth')
              .insert({
                email: vendorAuthData.email,
                password_hash: hashedPassword,
                vendor_id: claim.vendor_id,
                email_verified: true // Auto-verify for approved claims
              })
              .select()
              .single()

            if (authError) throw authError
            vendorAuthId = newVendorAuth.id
          }

          // Update vendor status to claimed
          const { error: updateVendorError } = await supabase
            .from('vendors')
            .update({
              claim_status: 'claimed',
              claimed_by: vendorAuthId,
              claim_date: new Date().toISOString(),
              verification_status: 'verified'
            })
            .eq('id', claim.vendor_id)

          if (updateVendorError) throw updateVendorError

          // Create default subscription (Free tier)
          const { data: freePlan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', 'Free')
            .single()

          if (!planError && freePlan) {
            const { error: subscriptionError } = await supabase
              .from('vendor_subscriptions')
              .insert({
                vendor_id: claim.vendor_id,
                plan_id: freePlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                user_id: vendorAuthId
              })

            if (subscriptionError) {
              console.error('Error creating default subscription:', subscriptionError)
            }
          }

        } else {
          // If rejected, reset vendor claim status
          const { error: resetVendorError } = await supabase
            .from('vendors')
            .update({
              claim_status: 'unclaimed'
            })
            .eq('id', claim.vendor_id)

          if (resetVendorError) throw resetVendorError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Claim ${decision} successfully`,
            claimId: claimId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-claim-details':
        // Get detailed claim information including verification documents
        const { data: claimDetails, error: detailsError } = await supabase
          .from('business_claims')
          .select(`
            *,
            vendors (
              id,
              business_name,
              city,
              state,
              category,
              description,
              contact_info,
              images,
              claim_status,
              verification_status
            )
          `)
          .eq('id', claimId)
          .single()

        if (detailsError) throw detailsError

        return new Response(
          JSON.stringify({ 
            success: true, 
            claim: claimDetails
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'bulk-approve':
        // Bulk approve multiple claims
        const { claimIds } = await req.json()
        
        if (!Array.isArray(claimIds) || claimIds.length === 0) {
          throw new Error('Claim IDs array is required')
        }

        // Update all claims to approved
        const { error: bulkUpdateError } = await supabase
          .from('business_claims')
          .update({
            claim_status: 'approved',
            admin_notes: 'Bulk approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminId
          })
          .in('id', claimIds)

        if (bulkUpdateError) throw bulkUpdateError

        // Get all approved claims to update vendors
        const { data: approvedClaims, error: getApprovedError } = await supabase
          .from('business_claims')
          .select('vendor_id')
          .in('id', claimIds)

        if (getApprovedError) throw getApprovedError

        const vendorIds = approvedClaims.map(claim => claim.vendor_id)

        // Update all vendors to claimed status
        const { error: bulkVendorUpdateError } = await supabase
          .from('vendors')
          .update({
            claim_status: 'claimed',
            claim_date: new Date().toISOString(),
            verification_status: 'verified'
          })
          .in('id', vendorIds)

        if (bulkVendorUpdateError) throw bulkVendorUpdateError

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${claimIds.length} claims approved successfully`
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

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
