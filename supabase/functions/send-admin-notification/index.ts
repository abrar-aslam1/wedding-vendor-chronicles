import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'business_submission' | 'user_registration' | 'vendor_status_change';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: EmailRequest = await req.json();
    
    // SMTP Configuration - Add these to your Supabase project secrets
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const SMTP_USER = Deno.env.get('SMTP_USER'); // Your email
    const SMTP_PASS = Deno.env.get('SMTP_PASS'); // Your app password
    const ADMIN_EMAIL = 'abrar@amarosystems.com';

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured');
    }

    // Generate email content based on type
    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'business_submission':
        subject = '🏢 New Business Submission - Find My Wedding Vendor';
        htmlContent = generateBusinessSubmissionEmail(data);
        break;
      case 'user_registration':
        subject = '👤 New User Registration - Find My Wedding Vendor';
        htmlContent = generateUserRegistrationEmail(data);
        break;
      case 'vendor_status_change':
        subject = '📋 Vendor Status Changed - Find My Wedding Vendor';
        htmlContent = generateVendorStatusChangeEmail(data);
        break;
      default:
        throw new Error('Invalid email type');
    }

    // Send email using fetch to a mail service
    const emailPayload = {
      to: ADMIN_EMAIL,
      subject: subject,
      html: htmlContent,
      from: SMTP_USER
    };

    // Using a simple SMTP service like EmailJS or similar
    // For this example, I'll create a simple email sender
    await sendEmail(emailPayload, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function sendEmail(payload: any, host: string, port: number, user: string, pass: string) {
  // Simple email sending using fetch to a mail service
  // You can replace this with your preferred email service
  
  // Using Resend API as an example (you can change this to your preferred service)
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wedding Vendor Notifications <noreply@findmyweddingvendor.com>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email service error: ${response.status}`);
    }
  } else {
    console.log('No email service configured, logging email content:');
    console.log('To:', payload.to);
    console.log('Subject:', payload.subject);
    console.log('HTML:', payload.html);
  }
}

function generateBusinessSubmissionEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🏢 New Business Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Find My Wedding Vendor Admin Panel</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0;">Business Details</h2>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Business Name:</strong> ${data.business_name}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Location:</strong> ${data.city}, ${data.state}</p>
          <p><strong>Description:</strong> ${data.description}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin-top: 0;">Contact Information</h3>
          <p><strong>Email:</strong> ${data.contact_info?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${data.contact_info?.phone || 'N/A'}</p>
          <p><strong>Website:</strong> ${data.contact_info?.website || 'N/A'}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Submission Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 4px;">Pending Review</span></p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://findmyweddingvendor.com/admin" 
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review in Admin Panel
          </a>
        </div>
      </div>
    </div>
  `;
}

function generateUserRegistrationEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">👤 New User Registration</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Find My Wedding Vendor</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0;">User Details</h2>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Registration Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
          <p><strong>Authentication Method:</strong> ${data.app_metadata?.provider || 'Email'}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin-top: 0;">User Statistics</h3>
          <p><strong>Email Confirmed:</strong> ${data.email_confirmed_at ? 'Yes' : 'No'}</p>
          <p><strong>Last Sign In:</strong> ${data.last_sign_in_at ? new Date(data.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
        </div>
      </div>
    </div>
  `;
}

function generateVendorStatusChangeEmail(data: any): string {
  const statusColor = data.status === 'approved' ? '#28a745' : '#dc3545';
  const statusEmoji = data.status === 'approved' ? '✅' : '❌';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📋 Vendor Status Changed</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Find My Wedding Vendor</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Business:</strong> ${data.business_name}</p>
          <p><strong>New Status:</strong> <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px;">${statusEmoji} ${data.status.toUpperCase()}</span></p>
          <p><strong>Changed By:</strong> ${data.admin_email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  `;
}