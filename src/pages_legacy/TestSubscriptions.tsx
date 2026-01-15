import React from 'react';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';

const TestSubscriptions = () => {
  const handleSelectPlan = (plan: any) => {
    console.log('Selected plan:', plan);
    alert(`You selected the ${plan.name} plan for $${(plan.price_monthly / 100).toFixed(2)}/month`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wedding Vendor Subscription Plans
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan to showcase your wedding services
          </p>
        </div>
        
        <SubscriptionPlans 
          onSelectPlan={handleSelectPlan}
          currentPlan="free"
        />
        
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Stripe Products Created:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Professional Plan: <code>prod_So4Z3HXQbdL7iR</code></li>
                <li>• Premium Plan: <code>prod_So4ZtQamK2YFPV</code></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Stripe Prices Created:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Professional: <code>price_1RsSQsG1OBZaOAlJaBem61PS</code></li>
                <li>• Premium: <code>price_1RsSQwG1OBZaOAlJNiirU6xT</code></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Where to Check:</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Stripe Dashboard:</strong> <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://dashboard.stripe.com/products</a></li>
              <li>• <strong>Database:</strong> Check the <code>subscription_plans</code> table in Supabase</li>
              <li>• <strong>This Test Page:</strong> Click the plan buttons to test selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSubscriptions;
