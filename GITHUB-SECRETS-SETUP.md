# GitHub Secrets Setup for Email System

## 📋 Required Secrets

To run the weekly email workflows, you need to add the following secrets to your GitHub repository:

### 1. **VITE_SUPABASE_URL**
- **Value:** `https://wpbdveyuuudhmwflrmqw.supabase.co`
- **Description:** Your Supabase project URL

### 2. **VITE_SUPABASE_ANON_KEY**
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A`
- **Description:** Your Supabase anonymous key

### 3. **SUPABASE_SERVICE_KEY** (Optional for weekly reports)
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM`
- **Description:** Your Supabase service role key (for admin operations)

### 4. **RESEND_API_KEY** (Already configured in Supabase)
- **Location:** Supabase Dashboard → Settings → Edge Functions → Environment Variables
- **Note:** This is already set up in your Supabase project for the notification system

## 🔧 How to Add Secrets

1. **Go to your GitHub repository**
   - Navigate to: https://github.com/abrar-aslam1/wedding-vendor-chronicles

2. **Access Settings**
   - Click on "Settings" tab
   - Scroll down to "Security" section
   - Click on "Secrets and variables" → "Actions"

3. **Add New Repository Secret**
   - Click "New repository secret"
   - Enter the secret name (e.g., `VITE_SUPABASE_URL`)
   - Enter the secret value
   - Click "Add secret"

4. **Repeat for all required secrets**

## 📧 Testing the Setup

Once you've added the secrets:

1. **Test the email system:**
   ```bash
   Go to: GitHub Actions → "Test Weekly Email" → "Run workflow"
   ```

2. **Test the full weekly report:**
   ```bash
   Go to: GitHub Actions → "Weekly Email Report" → "Run workflow"
   Enable "Send test email to admin only"
   ```

## 🔍 Verification

After adding secrets, you should see:
- ✅ Environment variables loaded properly
- ✅ Supabase connection successful
- ✅ Email notification sent to abrar@amarosystems.com

## 🚨 Security Notes

- Never commit these secrets to your repository
- The secrets are only accessible to GitHub Actions
- Rotate keys periodically for security
- The RESEND_API_KEY is safely stored in Supabase, not in GitHub

## 📝 Next Steps

1. Add the secrets to GitHub repository settings
2. Run the database setup SQL script in Supabase (if not done already)
3. Test the workflows
4. Set up weekly scheduling (already configured for Sundays at 9 AM EST)

## 🔗 Quick Links

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Your Repository Settings](https://github.com/abrar-aslam1/wedding-vendor-chronicles/settings)