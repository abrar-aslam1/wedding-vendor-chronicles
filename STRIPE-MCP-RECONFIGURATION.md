# Stripe MCP Server Reconfiguration Guide

This guide will help you reconfigure the Stripe MCP server to use your own Stripe account instead of the previous one.

## 🚨 Important: Why Reconfigure?

The current Stripe MCP server is connected to a different Stripe account. To use your own Stripe account for monetizing your wedding vendor platform, you need to:

1. **Disconnect from the old account**
2. **Connect to your own Stripe account**
3. **Recreate products and subscriptions**
4. **Update database references**

## 📋 Prerequisites

1. **Your own Stripe account** (sign up at https://stripe.com if you don't have one)
2. **Stripe API keys** from your dashboard
3. **Node.js** installed on your system

## 🔧 Step 1: Run the Reconfiguration Script

I've created an automated setup script for you:

```bash
# Run the setup script
node setup-stripe-mcp.js
```

This script will:
- ✅ Install/update the Stripe MCP server
- ✅ Prompt you for your Stripe API keys
- ✅ Configure environment variables
- ✅ Create server startup scripts

## 🔑 Step 2: Get Your Stripe API Keys

1. **Log into your Stripe Dashboard**: https://dashboard.stripe.com/
2. **Navigate to**: Developers → API keys
3. **Copy these keys**:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

⚠️ **Security Note**: Never share your secret key or commit it to version control!

## 🗄️ Step 3: Clean Up Old Stripe Data

Since we're switching accounts, we need to clean up the old Stripe references:

```sql
-- Clear old Stripe product/price IDs from database
UPDATE subscription_plans 
SET stripe_product_id = NULL, stripe_price_id = NULL 
WHERE stripe_product_id IS NOT NULL;
```

## 🛍️ Step 4: Create Products in Your Stripe Account

You have two options:

### Option A: Use the MCP Tools (Recommended)

Once your MCP server is configured, you can use the Stripe MCP tools to create products:

```javascript
// This will be done through the MCP interface
// Professional Plan: $29/month
// Premium Plan: $79/month
```

### Option B: Manual Creation in Stripe Dashboard

1. **Go to Products** in your Stripe Dashboard
2. **Create Professional Plan**:
   - Name: "Professional Plan"
   - Price: $29.00/month (recurring)
   - Description: "Enhanced vendor listing with priority placement"

3. **Create Premium Plan**:
   - Name: "Premium Plan" 
   - Price: $79.00/month (recurring)
   - Description: "Top-tier vendor listing with featured placement"

## 🔄 Step 5: Update Database with New Product IDs

After creating products, update your database:

```sql
-- Update Professional Plan
UPDATE subscription_plans 
SET stripe_product_id = 'prod_YOUR_NEW_PRODUCT_ID',
    stripe_price_id = 'price_YOUR_NEW_PRICE_ID'
WHERE name = 'Professional';

-- Update Premium Plan  
UPDATE subscription_plans 
SET stripe_product_id = 'prod_YOUR_NEW_PRODUCT_ID',
    stripe_price_id = 'price_YOUR_NEW_PRICE_ID'
WHERE name = 'Premium';
```

## 🎣 Step 6: Configure Webhooks

1. **In your Stripe Dashboard**: Developers → Webhooks
2. **Add endpoint**: `https://your-domain.com/api/stripe/webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret** and add to your `.env` file

## 🧪 Step 7: Test the Integration

### Test Cards for Development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Flow:
1. Create a test vendor account
2. Attempt to upgrade to Professional plan
3. Use test card for payment
4. Verify subscription appears in your Stripe Dashboard
5. Check database for subscription record

## 🚀 Step 8: Start Your Configured MCP Server

```bash
# Navigate to the MCP server directory
cd ~/Documents/Cline/MCP/stripe-agent-toolkit

# Start the server with your configuration
node start-server.js
```

The server should start on port 3001 and be ready to handle requests with your Stripe account.

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid API key" errors**:
   - Double-check your API keys in the `.env` file
   - Ensure you're using the correct test/live keys

2. **MCP server not responding**:
   - Check if the server is running on port 3001
   - Verify environment variables are loaded

3. **Database connection issues**:
   - Ensure Supabase credentials are correct
   - Check if subscription tables exist

4. **Webhook failures**:
   - Verify webhook URL is accessible
   - Check webhook secret matches your configuration

## 📊 Monetization Strategy

Now that you have your own Stripe account configured:

### Phase 1: Free Launch (0-3 months)
- Keep all plans free to build user base
- Focus on vendor acquisition and SEO
- Collect user feedback and improve platform

### Phase 2: Introduce Paid Plans (3-6 months)  
- Launch Professional ($29/month) and Premium ($79/month)
- Offer early bird discounts (50% off first 3 months)
- Grandfather existing vendors with free access

### Phase 3: Scale Revenue (6+ months)
- Add lead generation fees
- Introduce featured listing add-ons
- Consider commission-based booking fees

## 📞 Support

If you encounter issues:

1. **Check the logs**: Both MCP server and application logs
2. **Verify configuration**: Double-check all API keys and URLs
3. **Test incrementally**: Start with simple product creation
4. **Monitor Stripe Dashboard**: Watch for API calls and errors

## ✅ Verification Checklist

- [ ] Stripe MCP server installed and configured
- [ ] Your API keys added to environment files
- [ ] Old Stripe references cleared from database
- [ ] New products created in your Stripe account
- [ ] Database updated with new product/price IDs
- [ ] Webhooks configured and tested
- [ ] Test subscription flow completed
- [ ] MCP server running and responsive

Once all items are checked, your Stripe integration should be fully configured with your own account! 🎉
