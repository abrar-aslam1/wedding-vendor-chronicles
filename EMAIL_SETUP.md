# 📧 Email Notifications Setup Guide

This guide will help you set up SMTP email notifications for admin activities.

## 🚀 Quick Start

Run the setup script:
```bash
./scripts/setup-email-notifications.sh
```

## 📋 What You'll Get Notifications For

- **New Business Submissions** 🏢 - When someone submits a business via the form
- **New User Registrations** 👤 - When someone creates an account
- **Vendor Status Changes** 📋 - When you approve/reject a business

## 🔧 SMTP Configuration

### Option 1: Gmail SMTP (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → App passwords
   - Create a new app password for "Find My Wedding Vendor"
3. **Set Environment Variables** in Supabase:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `abrar@amarosystems.com`
   - `SMTP_PASS`: `your_app_password_here`

### Option 2: Resend Email Service (Alternative)
1. **Sign up** at [resend.com](https://resend.com)
2. **Get API Key** from dashboard
3. **Set Environment Variable**:
   - `RESEND_API_KEY`: `your_resend_api_key_here`

## 🔐 Setting Environment Variables

1. Go to [Supabase Functions Settings](https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions)
2. Click "Environment Variables"
3. Add each variable:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=abrar@amarosystems.com
SMTP_PASS=your_app_password
RESEND_API_KEY=your_resend_key (optional)
```

## ⚡ Automatic Queue Processing

The system uses a queue to reliably send emails. Set up a cron job to process the queue:

**Every 5 minutes:**
```bash
curl -X POST 'https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/process-notification-queue'
```

**Or use a service like:**
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- Your server's crontab

## 📧 Email Templates

The system sends beautiful HTML emails with:
- **Business submission details** (name, category, location, contact info)
- **User registration info** (email, date, authentication method)
- **Status change notifications** (approved/rejected with admin info)

## 🧪 Testing

1. **Deploy functions** (done by setup script)
2. **Set environment variables** in Supabase
3. **Test business submission** - submit a test business
4. **Test user registration** - create a test account
5. **Check your email** - should receive notifications

## 📊 Monitoring

- Check the `admin_notification_queue` table in Supabase
- Monitor Edge Function logs in Supabase dashboard
- Failed notifications remain in queue for retry

## 🔍 Troubleshooting

**No emails received?**
- Check environment variables are set correctly
- Verify Gmail app password is valid
- Check Supabase Edge Function logs

**Queue not processing?**
- Ensure cron job is running
- Check `process-notification-queue` function logs
- Verify queue table has unprocessed items

**Gmail authentication issues?**
- Ensure 2FA is enabled
- Use app password, not regular password
- Check "Less secure app access" is disabled (use app password instead)

## 🎯 Next Steps

1. Run the setup script
2. Configure your SMTP settings
3. Set up the cron job
4. Test with a business submission
5. Enjoy automated admin notifications!