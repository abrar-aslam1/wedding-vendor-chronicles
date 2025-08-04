#!/usr/bin/env node

/**
 * Cleanup Old Stripe Data Script
 * This script removes old Stripe product/price IDs from the database
 * so you can start fresh with your own Stripe account
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOldStripeData() {
  console.log('🧹 Cleaning up old Stripe data from database...\n');

  try {
    // 1. Clear old Stripe product/price IDs from subscription_plans
    console.log('📋 Clearing old Stripe IDs from subscription_plans...');
    const { data: plansData, error: plansError } = await supabase
      .from('subscription_plans')
      .update({ 
        stripe_product_id: null, 
        stripe_price_id: null 
      })
      .not('stripe_product_id', 'is', null);

    if (plansError) {
      throw new Error(`Failed to update subscription_plans: ${plansError.message}`);
    }

    console.log('✅ Cleared Stripe IDs from subscription_plans');

    // 2. Clear old Stripe data from vendor_subscriptions (if any exist)
    console.log('👥 Clearing old Stripe data from vendor_subscriptions...');
    const { data: subsData, error: subsError } = await supabase
      .from('vendor_subscriptions')
      .update({ 
        stripe_customer_id: null, 
        stripe_subscription_id: null,
        status: 'inactive'
      })
      .not('stripe_customer_id', 'is', null);

    if (subsError) {
      throw new Error(`Failed to update vendor_subscriptions: ${subsError.message}`);
    }

    console.log('✅ Cleared Stripe data from vendor_subscriptions');

    // 3. Show current subscription plans
    console.log('\n📊 Current subscription plans in database:');
    const { data: currentPlans, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('priority_ranking');

    if (fetchError) {
      throw new Error(`Failed to fetch subscription plans: ${fetchError.message}`);
    }

    if (currentPlans && currentPlans.length > 0) {
      currentPlans.forEach(plan => {
        console.log(`  • ${plan.name}: $${(plan.price_monthly / 100).toFixed(2)}/month`);
        console.log(`    - Stripe Product ID: ${plan.stripe_product_id || 'Not set'}`);
        console.log(`    - Stripe Price ID: ${plan.stripe_price_id || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('  No subscription plans found in database');
    }

    console.log('🎉 Cleanup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: node setup-stripe-mcp.js');
    console.log('2. Configure your Stripe MCP server with your API keys');
    console.log('3. Create new products in your Stripe account');
    console.log('4. Update the database with your new Stripe product/price IDs');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOldStripeData();
