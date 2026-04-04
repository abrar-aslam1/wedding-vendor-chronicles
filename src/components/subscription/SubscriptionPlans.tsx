import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Sparkles, TrendingUp, Eye, Camera, BarChart3, MessageSquare, Zap, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
}

// Rich feature definitions with descriptions that sell value
const planFeatures: Record<string, { icon: React.ReactNode; label: string; description?: string; included: boolean }[]> = {
  free: [
    { icon: <Eye className="h-4 w-4" />, label: 'Listed in directory', description: 'Couples can find you in search results', included: true },
    { icon: <Camera className="h-4 w-4" />, label: 'Up to 5 photos', description: 'Showcase your best work', included: true },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Contact info displayed', description: 'Phone, email & social links', included: true },
    { icon: <Shield className="h-4 w-4" />, label: 'Verified business badge', included: true },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Priority search placement', included: false },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics dashboard', included: false },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Featured in category', included: false },
    { icon: <Zap className="h-4 w-4" />, label: 'Lead notifications', included: false },
  ],
  professional: [
    { icon: <Eye className="h-4 w-4" />, label: 'Listed in directory', description: 'Couples can find you in search results', included: true },
    { icon: <Camera className="h-4 w-4" />, label: 'Unlimited photos', description: 'Full gallery to showcase your portfolio', included: true },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Contact info displayed', description: 'Phone, email & social links', included: true },
    { icon: <Shield className="h-4 w-4" />, label: 'Verified business badge', included: true },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Priority search placement', description: 'Appear above free listings', included: true },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics dashboard', description: 'See who views your profile & clicks', included: true },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Enhanced profile', description: 'Stand out with a richer profile page', included: true },
    { icon: <Zap className="h-4 w-4" />, label: 'Lead notifications', included: false },
  ],
  premium: [
    { icon: <Eye className="h-4 w-4" />, label: 'Listed in directory', description: 'Couples can find you in search results', included: true },
    { icon: <Camera className="h-4 w-4" />, label: 'Unlimited photos', description: 'Full gallery to showcase your portfolio', included: true },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Contact info displayed', description: 'Phone, email & social links', included: true },
    { icon: <Shield className="h-4 w-4" />, label: 'Verified business badge', included: true },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Top search placement', description: 'Always appear first in your category', included: true },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Advanced analytics', description: 'Hourly breakdowns, location data & conversion insights', included: true },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Featured in category', description: 'Highlighted with a featured badge across the site', included: true },
    { icon: <Zap className="h-4 w-4" />, label: 'Lead notifications', description: 'Instant alerts when couples inquire', included: true },
  ],
};

const planTaglines: Record<string, string> = {
  free: 'Get discovered by couples',
  professional: 'Grow your bookings',
  premium: 'Dominate your market',
};

const planCtaText: Record<string, string> = {
  free: 'Start Free',
  professional: 'Start Growing',
  premium: 'Go Premium',
};

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
    return `$${(priceInCents / 100).toFixed(0)}`;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
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
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => {
          const planKey = plan.name.toLowerCase();
          const features = planFeatures[planKey] || planFeatures.free;
          const isCurrentPlan = currentPlan === planKey;
          const isPremium = plan.is_featured;
          const isProfessional = planKey === 'professional';
          const tagline = planTaglines[planKey] || '';
          const ctaText = isCurrentPlan ? 'Current Plan' : (planCtaText[planKey] || `Choose ${plan.name}`);

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                isPremium
                  ? 'border-2 border-yellow-500 shadow-xl scale-[1.02] sm:scale-105'
                  : isProfessional
                  ? 'border-2 border-blue-400 shadow-md'
                  : 'border'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {isPremium && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 text-xs sm:text-sm font-semibold shadow-md">
                  Best Value
                </Badge>
              )}

              <CardHeader className="text-center pb-2 sm:pb-3 pt-6 sm:pt-8">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">{tagline}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price_monthly)}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>
                {plan.price_monthly > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Cancel anytime</p>
                )}
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="border-t my-3 sm:my-4"></div>

                <ul className="space-y-3 sm:space-y-3.5 mb-5 sm:mb-6 flex-1">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'}`}>
                        {feature.included ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-sm font-medium ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.label}
                        </span>
                        {feature.description && feature.included && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{feature.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-11 sm:h-10 text-sm sm:text-base font-semibold ${
                    isPremium
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
                      : isProfessional
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : ''
                  }`}
                  variant={isCurrentPlan ? 'outline' : planKey === 'free' ? 'outline' : 'default'}
                  disabled={isCurrentPlan}
                  onClick={() => onSelectPlan?.(plan)}
                >
                  {ctaText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500 pt-2">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4" />
          <span>Secure payments via Stripe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          <span>Instant activation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-4 w-4" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
};
