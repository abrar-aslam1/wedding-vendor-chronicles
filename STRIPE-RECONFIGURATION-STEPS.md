# 🔄 Stripe Account Reconfiguration - Quick Start Guide

Follow these steps to switch from the old Stripe account to your own Stripe account for monetizing your wedding vendor platform.

## 🚀 Quick Setup (5 minutes)

### Step 1: Clean Up Old Data
```bash
# Remove old Stripe references from database
node cleanup-old-stripe-data.js
```

### Step 2: Configure Your Stripe Account
```bash
# Set up Stripe MCP server with your API keys
node setup-stripe-mcp.js
```

### Step 3: Get Your Stripe Keys
1. Go to https://dashboard.stripe.com/
2. Navigate to **Developers → API keys**
3. Copy your **Publishable Key** and **Secret Key**
4. Enter them when prompted by the setup script

## 📋 What This Does

### The Cleanup Script:
- ✅ Removes old Stripe product/price IDs from database
- ✅ Clears old subscription data
- ✅ Shows current subscription plans status

### The Setup Script:
- ✅ Installs/configures Stripe MCP server
- ✅ Sets up your API keys
- ✅ Creates environment files
- ✅ Prepares server startup scripts

## 🎯 After Setup

Once the scripts complete, you'll need to:

1. **Create Products in Your Stripe Account**:
   - Professional Plan: $29/month
   - Premium Plan: $79/month

2. **Update Database** with your new product IDs

3. **Test the Integration** with Stripe test cards

## 📚 Detailed Guides

- **Complete Guide**: `STRIPE-MCP-RECONFIGURATION.md`
- **Stripe Config**: `src/config/stripe.ts`
- **Environment Setup**: `.env.example`

## 🆘 Need Help?

If you encounter issues:
1. Check the detailed guide: `STRIPE-MCP-RECONFIGURATION.md`
2. Verify your Stripe API keys are correct
3. Ensure your `.env` file is properly configured

## 💡 Monetization Strategy

**Current Status**: No visitors yet
**Recommendation**: Start with FREE plans to build user base, then introduce paid tiers after 3-6 months

### Suggested Timeline:
- **Months 1-3**: Free for all (focus on growth)
- **Months 4-6**: Introduce paid plans with early bird discounts
- **Months 6+**: Full pricing + additional revenue streams

---

**Ready to start?** Run the first command: `node cleanup-old-stripe-data.js`
