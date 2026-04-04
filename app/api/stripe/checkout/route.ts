import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// Server-side Supabase client with service role for DB writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, vendorId, userId, userEmail, planName, priceMonthly } = body;

    // Validate required fields
    if (!planId || !vendorId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Safety: reject free plans — they don't need checkout
    if (priceMonthly === 0) {
      return NextResponse.json(
        { error: 'Free plans do not require payment' },
        { status: 400 }
      );
    }

    // Safety: validate price is reasonable (between $1 and $500/month)
    if (priceMonthly < 100 || priceMonthly > 50000) {
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      );
    }

    // Check if this vendor already has a Stripe customer
    const { data: existingSub } = await supabaseAdmin
      .from('vendor_subscriptions')
      .select('stripe_customer_id')
      .eq('vendor_id', vendorId)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          vendor_id: vendorId,
          user_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Look up Stripe price ID from subscription_plans table
    const { data: plan } = await supabaseAdmin
      .from('subscription_plans')
      .select('stripe_price_id, name, price_monthly')
      .eq('id', planId)
      .single();

    let stripePriceId = plan?.stripe_price_id;

    // If no Stripe price exists yet, create the product and price in Stripe
    if (!stripePriceId) {
      const product = await stripe.products.create({
        name: `Wedding Vendor Chronicles - ${planName || plan?.name || 'Subscription'}`,
        metadata: { plan_id: planId },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceMonthly || plan?.price_monthly || 2900,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan_id: planId },
      });

      stripePriceId = price.id;

      // Save the Stripe IDs back to the database for future use
      await supabaseAdmin
        .from('subscription_plans')
        .update({
          stripe_product_id: product.id,
          stripe_price_id: price.id,
        })
        .eq('id', planId);
    }

    // Create Stripe Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        vendor_id: vendorId,
        user_id: userId,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          vendor_id: vendorId,
          user_id: userId,
          plan_id: planId,
        },
      },
      success_url: `${origin}/vendor-dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/list-business?checkout=cancelled`,
      // Safety: only allow one subscription per checkout
      allow_promotion_codes: true,
    });

    // Update vendor_subscriptions with customer ID (pending until webhook confirms)
    await supabaseAdmin
      .from('vendor_subscriptions')
      .update({
        stripe_customer_id: customerId,
      })
      .eq('vendor_id', vendorId);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
