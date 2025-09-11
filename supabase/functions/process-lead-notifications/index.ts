import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadNotificationRequest {
  inquiry_id: string
  vendor_ids: string[]
  customer_data: {
    name: string
    email: string
    phone?: string
    event_date?: string
    message?: string
  }
  notification_type: 'lead_inquiry' | 'multi_inquiry' | 'availability_request'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { inquiry_id, vendor_ids, customer_data, notification_type }: LeadNotificationRequest = await req.json()

    // Process each vendor for notification
    const notifications = []
    
    for (const vendor_id of vendor_ids) {
      // Try to find vendor in each table and get their email
      let vendor_data = null
      let vendor_source = ''
      
      // Check standard vendors table
      const { data: standardVendor } = await supabase
        .from('vendors')
        .select('id, business_name, contact_info')
        .eq('id', vendor_id)
        .single()
        
      if (standardVendor) {
        vendor_data = {
          business_name: standardVendor.business_name,
          email: standardVendor.contact_info?.email,
          phone: standardVendor.contact_info?.phone
        }
        vendor_source = 'vendors'
      } else {
        // Check Instagram vendors
        const { data: instagramVendor } = await supabase
          .from('instagram_vendors')
          .select('id, business_name, email, phone')
          .eq('id', vendor_id)
          .single()
          
        if (instagramVendor) {
          vendor_data = {
            business_name: instagramVendor.business_name,
            email: instagramVendor.email,
            phone: instagramVendor.phone
          }
          vendor_source = 'instagram_vendors'
        } else {
          // Check Google vendors
          const { data: googleVendor } = await supabase
            .from('vendors_google')
            .select('id, business_name, email, phone')
            .eq('id', vendor_id)
            .single()
            
          if (googleVendor) {
            vendor_data = {
              business_name: googleVendor.business_name,
              email: googleVendor.email,
              phone: googleVendor.phone
            }
            vendor_source = 'vendors_google'
          }
        }
      }

      // Skip if no vendor found or no email
      if (!vendor_data || !vendor_data.email) {
        console.log(`Skipping vendor ${vendor_id} - no email found`)
        continue
      }

      // Create notification record
      const { data: notification, error: notificationError } = await supabase
        .from('vendor_lead_notifications')
        .insert({
          vendor_id,
          vendor_source,
          vendor_business_name: vendor_data.business_name,
          vendor_email: vendor_data.email,
          vendor_phone: vendor_data.phone,
          lead_inquiry_id: inquiry_id,
          lead_customer_name: customer_data.name,
          lead_customer_email: customer_data.email,
          lead_customer_phone: customer_data.phone,
          lead_event_date: customer_data.event_date,
          lead_message: customer_data.message,
          notification_type,
          notification_status: 'pending'
        })
        .select()
        .single()

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
        continue
      }

      notifications.push(notification)

      // Send email notification using Resend
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
          },
          body: JSON.stringify({
            from: 'leads@findmyweddingvendor.com',
            to: [vendor_data.email],
            subject: `New Wedding Inquiry from ${customer_data.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Wedding Inquiry</h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Customer Details:</h3>
                  <p><strong>Name:</strong> ${customer_data.name}</p>
                  <p><strong>Email:</strong> ${customer_data.email}</p>
                  ${customer_data.phone ? `<p><strong>Phone:</strong> ${customer_data.phone}</p>` : ''}
                  ${customer_data.event_date ? `<p><strong>Event Date:</strong> ${customer_data.event_date}</p>` : ''}
                </div>
                
                ${customer_data.message ? `
                  <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Message:</h3>
                    <p>${customer_data.message}</p>
                  </div>
                ` : ''}
                
                <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Next Steps:</strong></p>
                  <ul>
                    <li>Reply to this email to respond directly to ${customer_data.name}</li>
                    <li>Call them at ${customer_data.phone || 'the number they provided'}</li>
                    <li>Visit your vendor dashboard to manage leads</li>
                  </ul>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
                  This lead came from FindMyWeddingVendor.com. 
                  <a href="mailto:unsubscribe@findmyweddingvendor.com">Unsubscribe from lead notifications</a>
                </p>
              </div>
            `
          })
        })

        if (emailResponse.ok) {
          const emailData = await emailResponse.json()
          
          // Update notification status to sent
          await supabase
            .from('vendor_lead_notifications')
            .update({
              notification_status: 'sent',
              email_message_id: emailData.id,
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)
        } else {
          const errorData = await emailResponse.text()
          console.error('Email sending failed:', errorData)
          
          // Update notification status to failed
          await supabase
            .from('vendor_lead_notifications')
            .update({
              notification_status: 'failed',
              failure_reason: errorData,
              failed_at: new Date().toISOString()
            })
            .eq('id', notification.id)
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
        
        // Update notification status to failed
        await supabase
          .from('vendor_lead_notifications')
          .update({
            notification_status: 'failed',
            failure_reason: emailError.message,
            failed_at: new Date().toISOString()
          })
          .eq('id', notification.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notifications.length,
        notifications
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing lead notifications:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
