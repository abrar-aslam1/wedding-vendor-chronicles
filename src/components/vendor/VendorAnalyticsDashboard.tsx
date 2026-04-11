import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface VendorAnalyticsDashboardProps {
  events: AnalyticsEvent[];
  tier: 'free' | 'professional' | 'premium';
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  view_profile: 'Profile Views',
  profile_view: 'Profile Views',
  call: 'Phone Reveals',
  phone: 'Phone Reveals',
  email: 'Email Clicks',
  visit_site: 'Website Visits',
  website: 'Website Visits',
  save: 'Favorites',
  favorite: 'Favorites',
  check_availability: 'Availability Checks',
  search_impression: 'Search Impressions',
};

const normalizeEventType = (event: AnalyticsEvent): string => {
  const type = event.event_type || event.event_data?.cta_type || 'unknown';
  // Normalize aliases
  if (type === 'profile_view') return 'view_profile';
  if (type === 'phone') return 'call';
  if (type === 'website') return 'visit_site';
  if (type === 'favorite') return 'save';
  return type;
};

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export const VendorAnalyticsDashboard: React.FC<VendorAnalyticsDashboardProps> = ({
  events,
  tier,
}) => {
  // Build daily activity series for last 30 days
  const dailySeries = useMemo(() => {
    const days: { date: string; views: number; contacts: number; total: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize 30 days of empty buckets
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        views: 0,
        contacts: 0,
        total: 0,
      });
    }

    const dayMap = new Map(days.map((d) => [d.date, d]));

    events.forEach((event) => {
      const dateKey = new Date(event.created_at).toISOString().split('T')[0];
      const bucket = dayMap.get(dateKey);
      if (!bucket) return;

      const type = normalizeEventType(event);
      bucket.total++;
      if (type === 'view_profile') {
        bucket.views++;
      } else if (['call', 'email', 'visit_site', 'check_availability'].includes(type)) {
        bucket.contacts++;
      }
    });

    return days.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [events]);

  // Build event-type breakdown
  const eventBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      const type = normalizeEventType(event);
      const label = EVENT_TYPE_LABELS[type] || type;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Period comparison: last 7 days vs previous 7 days (Premium)
  const periodComparison = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    let recent = 0;
    let previous = 0;
    events.forEach((event) => {
      const t = new Date(event.created_at).getTime();
      if (t >= sevenDaysAgo) recent++;
      else if (t >= fourteenDaysAgo) previous++;
    });

    const change = previous === 0 ? (recent > 0 ? 100 : 0) : ((recent - previous) / previous) * 100;
    return { recent, previous, change };
  }, [events]);

  // Conversion funnel (Premium)
  const funnel = useMemo(() => {
    let impressions = 0;
    let views = 0;
    let contacts = 0;
    events.forEach((event) => {
      const type = normalizeEventType(event);
      if (type === 'search_impression') impressions++;
      else if (type === 'view_profile') views++;
      else if (['call', 'email', 'visit_site', 'check_availability'].includes(type)) contacts++;
    });
    return { impressions, views, contacts };
  }, [events]);

  const isPremium = tier === 'premium';
  const hasData = events.length > 0;

  return (
    <div className="space-y-6">
      {/* Tier badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">Last 30 days of activity</p>
        </div>
        <Badge className={isPremium ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
          {isPremium && <Crown className="w-3 h-3 mr-1" />}
          {tier === 'premium' ? 'Premium' : 'Professional'}
        </Badge>
      </div>

      {!hasData && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your analytics will appear here as couples start discovering and interacting with your profile.
              Share your listing to get your first views!
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          {/* Premium: Period comparison */}
          {isPremium && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last 7 Days vs Previous 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold">{periodComparison.recent}</p>
                    <p className="text-xs text-gray-500">interactions this week</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {periodComparison.change > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : periodComparison.change < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-400" />
                    )}
                    <span
                      className={`text-lg font-semibold ${
                        periodComparison.change > 0
                          ? 'text-green-600'
                          : periodComparison.change < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {periodComparison.change > 0 ? '+' : ''}
                      {periodComparison.change.toFixed(0)}%
                    </span>
                    <span className="text-sm text-gray-500">vs last week ({periodComparison.previous})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Activity</CardTitle>
              <CardDescription>Profile views and contact actions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySeries}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="contactsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      interval={Math.floor(dailySeries.length / 8)}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Profile Views"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#viewsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="contacts"
                      name="Contacts"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#contactsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Breakdown</CardTitle>
              <CardDescription>How couples are interacting with your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {eventBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Premium: Conversion Funnel */}
          {isPremium && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
                <CardDescription>How visitors move through your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <FunnelStep
                    label="Search Impressions"
                    value={funnel.impressions}
                    max={Math.max(funnel.impressions, funnel.views, funnel.contacts, 1)}
                    color="bg-blue-500"
                  />
                  <FunnelStep
                    label="Profile Views"
                    value={funnel.views}
                    max={Math.max(funnel.impressions, funnel.views, funnel.contacts, 1)}
                    color="bg-purple-500"
                    conversionRate={
                      funnel.impressions > 0 ? (funnel.views / funnel.impressions) * 100 : null
                    }
                  />
                  <FunnelStep
                    label="Contact Actions"
                    value={funnel.contacts}
                    max={Math.max(funnel.impressions, funnel.views, funnel.contacts, 1)}
                    color="bg-green-500"
                    conversionRate={funnel.views > 0 ? (funnel.contacts / funnel.views) * 100 : null}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

const FunnelStep: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  conversionRate?: number | null;
}> = ({ label, value, max, color, conversionRate }) => {
  const widthPercent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          {conversionRate !== null && conversionRate !== undefined && (
            <span className="text-xs text-gray-500">{conversionRate.toFixed(1)}% conversion</span>
          )}
          <span className="font-semibold">{value}</span>
        </div>
      </div>
      <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
};
