# Setup Resend API Key for Email System

## 🚨 **Current Issue**
The email system is failing with a 500 error because the `RESEND_API_KEY` is not configured in your Supabase project.

## 🔧 **Solution: Configure Resend API Key**

### **Option 1: If you already have a Resend API key**

1. **Add to Supabase Environment Variables:**
   - Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions
   - Click "Environment Variables"
   - Add new variable:
     - **Name:** `RESEND_API_KEY`
     - **Value:** `your_existing_resend_api_key`

### **Option 2: If you need to create a Resend account**

1. **Sign up for Resend:**
   - Go to: https://resend.com/signup
   - Sign up with your email (abrar@amarosystems.com)

2. **Get your API key:**
   - After signing up, go to API Keys section
   - Create a new API key
   - Copy the API key (starts with `re_`)

3. **Add to Supabase:**
   - Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions
   - Click "Environment Variables"
   - Add new variable:
     - **Name:** `RESEND_API_KEY`
     - **Value:** `re_your_new_api_key_here`

### **Option 3: Alternative - Use a different email service**

If you prefer not to use Resend, I can modify the system to use:
- SendGrid
- Mailgun
- AWS SES
- Or any other email service

## 📧 **Quick Setup with Resend (Recommended)**

Resend is:
- ✅ **Free tier:** 3,000 emails/month
- ✅ **Easy setup:** Just need API key
- ✅ **Good deliverability:** Built for developers
- ✅ **Already integrated:** Your system is ready for it

## 🧪 **Test After Setup**

Once you add the `RESEND_API_KEY`:

1. **Test the system:**
   ```bash
   Go to: GitHub Actions → "Test Weekly Email" → "Run workflow"
   ```

2. **Check your email:**
   - You should receive a test weekly report at abrar@amarosystems.com
   - Check spam folder if not in inbox

## 🔍 **Verify Setup**

After adding the API key, the workflow should show:
- ✅ Environment variables loaded
- ✅ Supabase connection successful
- ✅ Email test successful
- ✅ Test weekly report sent

## 📝 **Current Status**
- ✅ GitHub secrets configured
- ✅ Supabase connection working
- ❌ Missing RESEND_API_KEY (causing 500 error)
- 🔄 Need to configure email service

## 🚀 **Next Steps**
1. Choose Option 1, 2, or 3 above
2. Add the RESEND_API_KEY to Supabase
3. Test the email system
4. Run the weekly report workflow

Would you like me to help you set up Resend, or do you have an existing email service you'd prefer to use?