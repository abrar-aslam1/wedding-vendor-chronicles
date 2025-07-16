#!/bin/bash

echo "🚀 Setting up Email Notifications for Admin Account"
echo "=================================================="

# Deploy the Edge Functions
echo "📤 Deploying Edge Functions..."
npx supabase functions deploy send-admin-notification
npx supabase functions deploy process-notification-queue  
npx supabase functions deploy auth-hook

echo ""
echo "🔧 SMTP Configuration Required:"
echo "================================"
echo ""
echo "You need to set these environment variables in your Supabase project:"
echo ""
echo "1. SMTP_HOST (default: smtp.gmail.com)"
echo "2. SMTP_PORT (default: 587)"
echo "3. SMTP_USER (your email address)"
echo "4. SMTP_PASS (your app password)"
echo "5. RESEND_API_KEY (optional - for Resend email service)"
echo ""
echo "📋 To set these in Supabase:"
echo "1. Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions"
echo "2. Click on 'Environment Variables'"
echo "3. Add each variable"
echo ""
echo "🔐 For Gmail SMTP:"
echo "1. Enable 2-factor authentication on your Gmail account"
echo "2. Generate an 'App Password' for this application"
echo "3. Use the app password as SMTP_PASS"
echo ""
echo "📧 Recommended Email Service (Resend):"
echo "1. Sign up at https://resend.com"
echo "2. Get your API key"
echo "3. Set RESEND_API_KEY environment variable"
echo ""
echo "⚡ Setting up Cron Job for Queue Processing:"
echo "You should set up a cron job to process the notification queue:"
echo "curl -X POST 'https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/process-notification-queue'"
echo ""
echo "✅ Setup complete! Configure the environment variables to start receiving notifications."