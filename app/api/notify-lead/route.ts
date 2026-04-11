import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for DB reads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.LEAD_NOTIFICATION_FROM_EMAIL || 'notifications@weddingvendorchronicles.com';

const EVENT_LABELS: Record<string, string> = {
  call: 'revealed your phone number',
  phone: 'revealed your phone number',
  email: 'clicked your email',
  visit_site: 'visited your website',
  website: 'visited your website',
  check_availability: 'checked your availability',
};

export async function POST(request: NextRequest) {
  try {
    const { vendorId, eventType, referrer } = await request.json();

    if (!vendorId || !eventType) {
      return NextResponse.json({ error: 'Missing vendorId or eventType' }, { status: 400 });
    }

    // Only fire for contact-type events
    if (!EVENT_LABELS[eventType]) {
      return NextResponse.json({ skipped: true, reason: 'event type not eligible' });
    }

    // Look up vendor and verify Premium tier + notifications enabled
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('id, business_name, contact_info, subscription_tier')
      .eq('id', vendorId)
      .maybeSingle();

    if (vendorError || !vendor) {
      return NextResponse.json({ skipped: true, reason: 'vendor not found' });
    }

    if (vendor.subscription_tier !== 'premium') {
      return NextResponse.json({ skipped: true, reason: 'not premium' });
    }

    const contactInfo = (vendor.contact_info as Record<string, any>) || {};
    if (contactInfo.lead_notifications !== 'true') {
      return NextResponse.json({ skipped: true, reason: 'notifications disabled' });
    }

    const recipientEmail = contactInfo.email;
    if (!recipientEmail) {
      return NextResponse.json({ skipped: true, reason: 'no email on file' });
    }

    if (!RESEND_API_KEY) {
      console.error('[notify-lead] RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const action = EVENT_LABELS[eventType];
    const dashboardUrl = `${request.nextUrl.origin}/vendor-dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Lead Activity</h1>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 32px 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; line-height: 1.6;">
              Hi <strong>${escapeHtml(vendor.business_name)}</strong>,
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Someone just <strong>${action}</strong> on your listing.
            </p>
            ${referrer ? `<p style="font-size: 14px; color: #6b7280;">From: ${escapeHtml(referrer)}</p>` : ''}
            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
              This is a hot lead — couples typically reach out within minutes of viewing contact info.
            </p>
            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              You're receiving this because lead notifications are enabled on your Premium plan.
              <br />
              Manage your settings in the <a href="${dashboardUrl}" style="color: #8b5cf6;">vendor dashboard</a>.
            </p>
          </div>
        </body>
      </html>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: `🔔 New lead: someone ${action}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      console.error('[notify-lead] Resend error:', resendRes.status, errorText);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('[notify-lead] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
