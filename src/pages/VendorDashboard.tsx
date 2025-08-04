import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Phone, 
  Mail, 
  Globe, 
  Heart,
  TrendingUp,
  Settings,
  CreditCard,
  FileText,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VendorAnalytics, Vendor, VendorSubscription, SubscriptionPlan } from '@/integrations/supabase/types';

interface VendorDashboardProps {
  vendorId: string;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendorId }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVendorData();
    fetchAnalytics();
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_subscriptions (
            *,
            subscription_plans (*)
          )
        `)
        .eq('id', vendorId)
        .single();

      if (vendorError) throw vendorError;
      
      setVendor(vendorData);
      setSubscription(vendorData.vendor_subscriptions?.[0] || null);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor information');
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Call our analytics edge function
      const response = await fetch('/api/vendor-analytics-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          dateRange: '30'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set mock data for development
      setAnalytics({
        totals: {
          profile_views: 245,
          contact_clicks: 18,
          phone_reveals: 12,
          email_clicks: 8,
          website_clicks: 15,
          photo_views: 89,
          favorites_added: 6,
          search_impressions: 1250
        },
        basic_metrics: {
          profile_views: 245,
          contact_clicks: 18,
          conversion_rate: '7.35'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionTier = () => {
    return subscription?.subscription_plans?.name?.toLowerCase() || 'free';
  };

  const getSubscriptionBadge = () => {
    const tier = getSubscriptionTier();
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      premium: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={colors[tier as keyof typeof colors] || colors.free}>
        {tier === 'premium' && <Crown className="w-3 h-3 mr-1" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vendor?.business_name || 'Vendor Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {vendor?.city}, {vendor?.state} • {vendor?.category}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getSubscriptionBadge()}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totals.profile_views || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Clicks</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totals.contact_clicks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.basic_metrics.conversion_rate || '0'}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phone Reveals</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totals.phone_reveals || 0}</div>
              <p className="text-xs text-muted-foreground">Direct inquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totals.favorites_added || 0}</div>
              <p className="text-xs text-muted-foreground">Saved by couples</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest profile interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile viewed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Contact form submitted</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Added to favorites</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your vendor profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Update Profile Information
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>How your profile is performing this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics?.totals.search_impressions || 0}
                    </div>
                    <div className="text-sm text-gray-500">Search Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics?.totals.email_clicks || 0}
                    </div>
                    <div className="text-sm text-gray-500">Email Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics?.totals.website_clicks || 0}
                    </div>
                    <div className="text-sm text-gray-500">Website Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics?.totals.photo_views || 0}
                    </div>
                    <div className="text-sm text-gray-500">Photo Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Detailed insights into your profile performance
                  {getSubscriptionTier() === 'free' && (
                    <span className="block mt-2 text-sm text-amber-600">
                      Upgrade to Professional for advanced analytics
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getSubscriptionTier() === 'free' ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Advanced Analytics Available
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Upgrade to Professional or Premium to access detailed analytics,
                      including hourly breakdowns, location data, and conversion insights.
                    </p>
                    <Button>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Professional/Premium analytics would go here */}
                    <p className="text-center text-gray-500">
                      Advanced analytics dashboard coming soon...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Update your business information and photos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Profile management interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Current Plan</h3>
                      <p className="text-sm text-gray-600">
                        {subscription?.subscription_plans?.name || 'Free'} Plan
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${((subscription?.subscription_plans?.price_monthly || 0) / 100).toFixed(2)}/month
                      </div>
                      {getSubscriptionTier() !== 'premium' && (
                        <Button size="sm" className="mt-2">
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
