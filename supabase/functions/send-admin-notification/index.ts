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
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = 'abrar@amarosystems.com';

    console.log('Checking environment variables...');
    console.log('RESEND_API_KEY present:', !!RESEND_API_KEY);

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment variables');
      throw new Error('RESEND_API_KEY not configured');
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

    // Send email using Resend
    const emailPayload = {
      from: 'Wedding Vendor Notifications <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: subject,
      html: htmlContent
    };

    console.log('Sending email via Resend...');
    await sendEmail(emailPayload, RESEND_API_KEY);

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

async function sendEmail(payload: any, apiKey: string) {
  console.log('Calling Resend API...');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  console.log('Resend API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error:', errorText);
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Email sent successfully:', result);
  return result;
}

function generateBusinessSubmissionEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="https://findmyweddingvendor.com/Find-My Wedding-Favicon/favicon-32x32.png" alt="Find My Wedding Vendor" style="width: 32px; height: 32px;" />
          <h1 style="margin: 0; font-size: 24px;">🏢 New Business Submission</h1>
        </div>
        <p style="margin: 0; opacity: 0.9;">Find My Wedding Vendor Admin Panel</p>
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
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="https://findmyweddingvendor.com/Find-My Wedding-Favicon/favicon-32x32.png" alt="Find My Wedding Vendor" style="width: 32px; height: 32px;" />
          <h1 style="margin: 0; font-size: 24px;">👤 New User Registration</h1>
        </div>
        <p style="margin: 0; opacity: 0.9;">Find My Wedding Vendor</p>
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
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="https://findmyweddingvendor.com/Find-My Wedding-Favicon/favicon-32x32.png" alt="Find My Wedding Vendor" style="width: 32px; height: 32px;" />
          <h1 style="margin: 0; font-size: 24px;">📋 Vendor Status Changed</h1>
        </div>
        <p style="margin: 0; opacity: 0.9;">Find My Wedding Vendor</p>
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