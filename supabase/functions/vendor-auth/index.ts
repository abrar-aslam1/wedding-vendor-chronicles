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
    const { action, email, password, vendorId, token } = await req.json()

    switch (action) {
      case 'register':
        // Create vendor auth record
        const hashedPassword = await hashPassword(password)
        const { data: authData, error: authError } = await supabase
          .from('vendor_auth')
          .insert({
            email,
            password_hash: hashedPassword,
            vendor_id: vendorId,
            verification_token: crypto.randomUUID()
          })
          .select()
          .single()

        if (authError) throw authError

        return new Response(
          JSON.stringify({ success: true, data: authData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'login':
        // Verify vendor credentials
        const { data: vendor, error: loginError } = await supabase
          .from('vendor_auth')
          .select('*')
          .eq('email', email)
          .single()

        if (loginError || !vendor) {
          throw new Error('Invalid credentials')
        }

        const isValidPassword = await verifyPassword(password, vendor.password_hash)
        if (!isValidPassword) {
          throw new Error('Invalid credentials')
        }

        // Generate JWT token
        const jwtToken = await generateJWT(vendor.id, vendor.vendor_id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            token: jwtToken,
            vendor: {
              id: vendor.id,
              email: vendor.email,
              vendor_id: vendor.vendor_id,
              email_verified: vendor.email_verified
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'verify-email':
        // Verify email with token
        const { error: verifyError } = await supabase
          .from('vendor_auth')
          .update({ email_verified: true, verification_token: null })
          .eq('verification_token', token)

        if (verifyError) throw verifyError

        return new Response(
          JSON.stringify({ success: true, message: 'Email verified successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'reset-password':
        // Generate reset token
        const resetToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 3600000) // 1 hour

        const { error: resetError } = await supabase
          .from('vendor_auth')
          .update({ 
            reset_token: resetToken, 
            reset_token_expires: expiresAt.toISOString() 
          })
          .eq('email', email)

        if (resetError) throw resetError

        // TODO: Send reset email
        return new Response(
          JSON.stringify({ success: true, message: 'Reset token generated', resetToken }),
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

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

async function generateJWT(authId: string, vendorId: string): Promise<string> {
  // Simple JWT implementation - in production, use proper JWT library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ 
    sub: authId, 
    vendor_id: vendorId, 
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  }))
  
  return `${header}.${payload}.signature`
}
