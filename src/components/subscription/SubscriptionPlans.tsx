import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, SubscriptionFeatures } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  onSelectPlan, 
  currentPlan 
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('priority_ranking', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return 'Free';
    return `$${(priceInCents / 100).toFixed(0)}/month`;
  };

  const getFeaturesList = (features: SubscriptionFeatures) => {
    const featureMap = {
      basic_listing: 'Basic listing',
      contact_info: 'Contact information display',
      basic_photos: 'Basic photo gallery',
      unlimited_photos: 'Unlimited photos',
      priority_placement: 'Priority placement in search',
      basic_analytics: 'Basic analytics',
      enhanced_profile: 'Enhanced profile features',
      featured_placement: 'Featured placement',
      lead_contact_access: 'Direct lead contact access',
      advanced_analytics: 'Advanced analytics & insights',
      top_priority: 'Top priority in all searches'
    };

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => featureMap[key as keyof SubscriptionFeatures])
      .filter(Boolean);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'professional':
        return <Star className="h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const features = plan.features as SubscriptionFeatures;
        const featuresList = getFeaturesList(features);
        const isCurrentPlan = currentPlan === plan.name.toLowerCase();
        const isPremium = plan.is_featured;

        return (
          <Card 
            key={plan.id} 
            className={`relative ${isPremium ? 'border-yellow-500 shadow-lg' : ''} ${
              isCurrentPlan ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {isPremium && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPlanIcon(plan.name)}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.price_monthly)}
              </CardDescription>
              {plan.max_photos && (
                <p className="text-sm text-gray-600">
                  Up to {plan.max_photos} photos
                </p>
              )}
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {featuresList.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${isPremium ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                variant={isCurrentPlan ? 'outline' : 'default'}
                disabled={isCurrentPlan}
                onClick={() => onSelectPlan?.(plan)}
              >
                {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
