// Stripe Configuration
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
  
  // Subscription plans - these will be created in your Stripe account
  plans: {
    free: {
      name: 'Free',
      price: 0,
      features: ['Basic listing', 'Contact info', 'Up to 5 photos']
    },
    professional: {
      name: 'Professional',
      price: 2900, // $29.00 in cents
      features: [
        'Unlimited photos',
        'Priority placement',
        'Basic analytics',
        'Enhanced profile'
      ]
    },
    premium: {
      name: 'Premium',
      price: 7900, // $79.00 in cents
      features: [
        'Everything in Professional',
        'Featured placement',
        'Lead contact access',
        'Advanced analytics',
        'Top priority in searches'
      ]
    }
  }
};

// Stripe API endpoints
export const stripeEndpoints = {
  createCustomer: '/api/stripe/create-customer',
  createSubscription: '/api/stripe/create-subscription',
  cancelSubscription: '/api/stripe/cancel-subscription',
  updateSubscription: '/api/stripe/update-subscription',
  createPaymentMethod: '/api/stripe/create-payment-method',
  webhook: '/api/stripe/webhook'
};
