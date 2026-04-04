---
name: stripe-account-manager
description: Manage Stripe account configuration for the wedding vendor platform — set up API keys, create/update subscription products and prices, manage webhooks, clean up old data, and troubleshoot Stripe integration issues.
argument-hint: "[action: setup | products | webhooks | keys | cleanup | status]"
allowed-tools: Read Grep Glob Bash Edit Write
---

# Stripe Account Manager

You are managing the Stripe integration for a wedding vendor marketplace platform. The platform uses Stripe for vendor subscription billing with three tiers: Free, Professional ($29/mo), and Premium ($79/mo).

## Key Files

- `src/config/stripe.ts` — Stripe config with plan definitions and API endpoints
- `.env` / `.env.example` — Environment variables for Stripe keys
- `setup-stripe-mcp.js` — Stripe MCP server setup script
- `cleanup-old-stripe-data.js` — Script to remove old Stripe references
- `update-stripe-keys.js` — Key update utility
- `STRIPE-RECONFIGURATION-STEPS.md` — Step-by-step reconfiguration guide
- `STRIPE-MCP-RECONFIGURATION.md` — Detailed MCP reconfiguration guide

## Actions

Based on `$ARGUMENTS`, perform the appropriate action:

### `setup` — Full Stripe Account Setup
1. Check if `.env` exists and has Stripe keys configured
2. Validate the key format (pk_test_/pk_live_ and sk_test_/sk_live_)
3. Walk the user through getting keys from https://dashboard.stripe.com/developers
4. Update `.env` with the provided keys
5. Run `node setup-stripe-mcp.js` if MCP server needs configuration
6. Verify the setup by checking key format and environment

### `products` — Create or Update Subscription Products
1. Read current plan definitions from `src/config/stripe.ts`
2. Show the user the current plan structure (Free, Professional, Premium)
3. If the user wants to modify plans, update `src/config/stripe.ts`
4. Remind the user to create matching products in the Stripe Dashboard
5. Provide the exact product names and prices to create

### `webhooks` — Webhook Configuration
1. Check current webhook secret in `.env` (VITE_STRIPE_WEBHOOK_SECRET)
2. Guide the user to set up webhooks in Stripe Dashboard
3. Required webhook events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Webhook endpoint: `/api/stripe/webhook`
5. Update the webhook secret in `.env`

### `keys` — View or Update API Keys
1. Read current keys from `.env` (mask all but last 4 characters for security)
2. Show whether keys are test or live mode
3. If updating, validate format before saving
4. Never display full secret keys — always mask them
5. Update `src/config/stripe.ts` if endpoint configuration changes

### `cleanup` — Clean Up Old Stripe Data
1. Run `node cleanup-old-stripe-data.js`
2. Check the database for any remaining old Stripe references
3. Report what was cleaned up

### `status` — Check Current Stripe Integration Status
1. Check if `.env` has Stripe keys set (not placeholder values)
2. Verify key format (test vs live)
3. Check if webhook secret is configured
4. Read `src/config/stripe.ts` for current plan configuration
5. Report overall integration health

### No argument or `help`
Show a summary of available actions and current integration status.

## Safety Rules

- NEVER display full Stripe secret keys (sk_*) — always mask them
- NEVER commit `.env` files or secret keys to git
- Warn the user before any destructive operations (cleanup, key replacement)
- Always confirm before modifying environment files
- Recommend test mode keys (pk_test_, sk_test_) for development
- If live keys are detected, warn the user and confirm they intend to use production mode

## Subscription Plan Reference

| Plan         | Price     | Price (cents) | Features                                              |
|--------------|-----------|---------------|-------------------------------------------------------|
| Free         | $0/mo     | 0             | Basic listing, contact info, up to 5 photos           |
| Professional | $29/mo    | 2900          | Unlimited photos, priority placement, basic analytics  |
| Premium      | $79/mo    | 7900          | Featured placement, lead access, advanced analytics    |
