import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // If webhook secret is configured, verify the signature
  let event: Stripe.Event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }
  } else {
    // No webhook secret — parse the event but log a warning
    console.warn('No STRIPE_WEBHOOK_SECRET set — skipping signature verification');
    event = JSON.parse(body) as Stripe.Event;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const vendorId = session.metadata?.vendor_id;
  const planId = session.metadata?.plan_id;
  const userId = session.metadata?.user_id;

  if (!vendorId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Retrieve the subscription to get period dates
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

  // Update vendor_subscriptions with Stripe details
  const periodStart = subscription.current_period_start || subscription.items?.data?.[0]?.current_period_start;
  const periodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;

  await supabaseAdmin
    .from('vendor_subscriptions')
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: 'active',
      ...(periodStart && { current_period_start: new Date(periodStart * 1000).toISOString() }),
      ...(periodEnd && { current_period_end: new Date(periodEnd * 1000).toISOString() }),
    })
    .eq('vendor_id', vendorId);

  // Get plan name to update vendor's subscription_tier
  const { data: plan } = await supabaseAdmin
    .from('subscription_plans')
    .select('name')
    .eq('id', planId)
    .single();

  if (plan) {
    await supabaseAdmin
      .from('vendors')
      .update({
        subscription_tier: plan.name.toLowerCase(),
        is_featured: plan.name.toLowerCase() === 'premium',
      })
      .eq('id', vendorId);
  }

  console.log(`Checkout completed for vendor ${vendorId}, subscription ${subscriptionId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = subscription as any;
  const vendorId = sub.metadata?.vendor_id;
  if (!vendorId) return;

  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    incomplete: 'inactive',
    incomplete_expired: 'cancelled',
    trialing: 'active',
    paused: 'inactive',
  };

  const periodStart = sub.current_period_start || sub.items?.data?.[0]?.current_period_start;
  const periodEnd = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;

  await supabaseAdmin
    .from('vendor_subscriptions')
    .update({
      status: statusMap[sub.status] || 'inactive',
      ...(periodStart && { current_period_start: new Date(periodStart * 1000).toISOString() }),
      ...(periodEnd && { current_period_end: new Date(periodEnd * 1000).toISOString() }),
    })
    .eq('vendor_id', vendorId);

  console.log(`Subscription updated for vendor ${vendorId}: ${sub.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const vendorId = subscription.metadata?.vendor_id;
  if (!vendorId) return;

  // Downgrade vendor to free tier
  await supabaseAdmin
    .from('vendor_subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('vendor_id', vendorId);

  await supabaseAdmin
    .from('vendors')
    .update({
      subscription_tier: 'free',
      is_featured: false,
    })
    .eq('id', vendorId);

  console.log(`Subscription cancelled for vendor ${vendorId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;
  if (!subscriptionId) return;

  // Find vendor by subscription ID
  const { data: sub } = await supabaseAdmin
    .from('vendor_subscriptions')
    .select('vendor_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    await supabaseAdmin
      .from('vendor_subscriptions')
      .update({ status: 'past_due' })
      .eq('vendor_id', sub.vendor_id);

    console.log(`Payment failed for vendor ${sub.vendor_id}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabaseAdmin
    .from('vendor_subscriptions')
    .select('vendor_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    await supabaseAdmin
      .from('vendor_subscriptions')
      .update({ status: 'active' })
      .eq('vendor_id', sub.vendor_id);

    console.log(`Payment succeeded for vendor ${sub.vendor_id}`);
  }
}
