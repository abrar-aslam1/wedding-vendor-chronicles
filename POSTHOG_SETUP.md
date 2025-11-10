# PostHog Analytics Setup - Complete Guide

PostHog has been successfully integrated into your Find My Wedding Vendor application! This document explains what was set up and how to use it.

## What Was Configured

### 1. Core Configuration Files

#### [app/providers/PostHogProvider.tsx](app/providers/PostHogProvider.tsx)
- Client-side PostHog provider that wraps your entire application
- Initializes PostHog with your API key
- Enables exception tracking automatically
- Uses debug mode in development for easier troubleshooting

#### [lib/posthog.ts](lib/posthog.ts)
- Server-side PostHog client using `posthog-node`
- For sending events from server-side API routes or edge functions

#### [next.config.mjs](next.config.mjs)
- Proxy configuration to route PostHog requests through your domain
- `/ingest/*` → PostHog US endpoint (prevents ad blockers from blocking analytics)
- Configured for SSR compatibility

### 2. Environment Variables

Already configured in `.env.local`:
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_eks7eRTlisR8V7DRjY0s1ZfPaDa0oNfj9TkeZmCvA9A
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Important for Production:** Make sure to add these environment variables to your hosting provider (Netlify, Vercel, etc.)

### 3. Authentication Tracking

PostHog tracking has been added to all authentication flows:

#### User (Couple) Authentication - [src/components/auth/UserAuthForm.tsx](src/components/auth/UserAuthForm.tsx)
- `user_signed_in` - Tracks successful email/password login
- `user_signed_up` - Tracks successful email/password registration
- `user_sign_in_failed` - Tracks failed login attempts
- `user_sign_up_failed` - Tracks failed registration attempts
- `user_oauth_initiated` - Tracks Google OAuth start
- `user_oauth_failed` - Tracks Google OAuth failures
- **User identification** with `posthog.identify()` on successful login

#### Vendor Authentication - [src/components/auth/VendorAuthForm.tsx](src/components/auth/VendorAuthForm.tsx)
- `vendor_signed_in` - Tracks successful vendor login
- `vendor_signed_up` - Tracks successful vendor registration
- `vendor_sign_in_failed` - Tracks failed vendor login
- `vendor_sign_up_failed` - Tracks failed vendor registration
- `vendor_oauth_initiated` - Tracks vendor Google OAuth start
- `vendor_oauth_failed` - Tracks vendor Google OAuth failures
- `vendor_password_reset_requested` - Tracks password reset requests
- `vendor_password_reset_failed` - Tracks password reset failures
- **Vendor identification** with `posthog.identify()` on successful login

#### OAuth Callback - [src/pages/AuthCallback.tsx](src/pages/AuthCallback.tsx)
- `oauth_callback_completed` - Tracks successful OAuth flow completion
- Identifies users after OAuth with provider information
- Tracks whether it's a new profile or existing user

### 4. Analytics Utility Library - [src/lib/analytics.ts](src/lib/analytics.ts)

A comprehensive utility library with pre-built tracking functions:

#### Page Tracking
```typescript
trackPageView('/vendors/photography')
```

#### Vendor Interactions
```typescript
// Track when users view vendors
trackVendorView(vendorId, category, { vendor_name, rating })

// Track when users contact vendors
trackVendorContact(vendorId, 'email') // or 'phone', 'form', 'website'

// Track favorite actions
trackVendorFavorite(vendorId, 'add') // or 'remove'
```

#### Search & Filters
```typescript
// Track searches
trackSearch('wedding photographers', { location: 'New York' })

// Track filter usage
trackFilterApplied('price_range', '$$')
```

#### Lead Generation
```typescript
trackLeadSubmitted(vendorId, 'contact_form')
```

#### Vendor Dashboard Actions
```typescript
trackVendorDashboardAction('view_analytics')
trackVendorProfileUpdate('business_hours', ['monday', 'tuesday'])
```

#### Reviews & Engagement
```typescript
trackReviewSubmitted(vendorId, 5)
trackGalleryImageView(vendorId, imageId)
```

#### User Preferences
```typescript
trackPreferencesUpdated('notification_settings', { email: true })
```

#### Error Tracking
```typescript
trackError('api_error', 'Failed to load vendors', { endpoint: '/api/vendors' })
```

#### Feature Flags
```typescript
const isEnabled = isFeatureEnabled('new-search-ui')
const flagValue = getFeatureFlag('button-color')
```

### 5. Example Implementation - [src/pages/VendorDetail.tsx](src/pages/VendorDetail.tsx)

The VendorDetail page now includes:
- Automatic vendor view tracking when the page loads
- Favorite/unfavorite event tracking
- Demonstrates how to integrate analytics into existing components

## How to Use PostHog in Your App

### Basic Usage in Components

```typescript
import posthog from "posthog-js";

// Track a custom event
posthog.capture('button_clicked', {
  button_name: 'book_consultation',
  page: 'vendor_detail'
});

// Identify a user (do this once after login)
posthog.identify(userId, {
  email: user.email,
  plan: 'premium',
  signup_date: '2025-01-10'
});

// Update user properties
posthog.setPersonProperties({
  favorite_category: 'photography',
  wedding_date: '2025-06-15'
});
```

### Using the Analytics Utilities

Import and use the pre-built tracking functions:

```typescript
import { trackVendorView, trackSearch, trackLeadSubmitted } from "@/lib/analytics";

// In your component
const handleSearch = (query: string) => {
  trackSearch(query, { category: selectedCategory });
  // ... rest of search logic
};
```

### Best Practices

1. **Always identify users after authentication** - This is already done in the auth forms
2. **Track key user journeys** - Search, view vendors, contact vendors, submit leads
3. **Use descriptive event names** - Use snake_case like `vendor_contacted` not `contact`
4. **Include relevant properties** - Add context to help analyze the data later
5. **Don't track sensitive data** - Never send passwords, credit cards, or PII

## Verifying Your Setup

### 1. Check PostHog Dashboard

1. Go to [https://us.posthog.com](https://us.posthog.com)
2. Log in to your account
3. Navigate to "Events" to see real-time events coming in
4. Check "Persons" to see identified users

### 2. Test in Development

The dev server is running at [http://localhost:3000](http://localhost:3000)

1. Open the browser console (F12)
2. Look for PostHog debug logs (enabled in development)
3. Try signing in/up to generate events
4. Visit a vendor page to trigger `vendor_viewed` events
5. Check PostHog dashboard for events (may take 1-2 minutes to appear)

### 3. Network Tab

1. Open DevTools → Network tab
2. Filter by "ingest"
3. You should see requests to `/ingest/batch` when events fire

## Events Being Tracked

### Authentication Events
- `user_signed_in` - User logs in via email/password
- `user_signed_up` - User registers via email/password
- `user_sign_in_failed` - Login attempt failed
- `user_sign_up_failed` - Registration attempt failed
- `user_oauth_initiated` - User starts Google OAuth
- `user_oauth_failed` - OAuth flow failed
- `vendor_signed_in` - Vendor logs in
- `vendor_signed_up` - Vendor registers
- `vendor_sign_in_failed` - Vendor login failed
- `vendor_sign_up_failed` - Vendor registration failed
- `vendor_oauth_initiated` - Vendor starts Google OAuth
- `vendor_oauth_failed` - Vendor OAuth failed
- `vendor_password_reset_requested` - Password reset requested
- `vendor_password_reset_failed` - Password reset failed
- `oauth_callback_completed` - OAuth callback successful

### Vendor Interaction Events (via analytics.ts)
- `vendor_viewed` - User views vendor detail page
- `vendor_contacted` - User contacts vendor
- `vendor_favorited` - User favorites/unfavorites vendor
- `search_performed` - User performs a search
- `filter_applied` - User applies a filter
- `lead_submitted` - User submits a lead form

### User Property Tracking

When users authenticate, we track:
- `email` - User's email address
- `user_type` - 'couple' or 'vendor'
- `email_verified` - Whether email is verified
- `oauth_provider` - OAuth provider if applicable (e.g., 'google')

## Next Steps

### Recommended Events to Add

1. **Search Page**
   - Track when users perform searches
   - Track filter applications
   - Track result clicks

2. **Homepage**
   - Track category selections
   - Track featured vendor clicks
   - Track CTA button clicks

3. **Vendor Dashboard**
   - Track profile updates
   - Track when vendors view their analytics
   - Track lead responses

4. **Contact Forms**
   - Track form views
   - Track form submissions
   - Track form field interactions

### Example: Adding Search Tracking

```typescript
// In your search component
import { trackSearch, trackFilterApplied } from "@/lib/analytics";

const handleSearch = (query: string, filters: SearchFilters) => {
  // Track the search
  trackSearch(query, {
    category: filters.category,
    location: filters.location,
    price_range: filters.priceRange,
  });

  // Execute search
  performSearch(query, filters);
};

const handleFilterChange = (filterType: string, value: any) => {
  trackFilterApplied(filterType, value);
  // Apply filter
};
```

## Deployment Checklist

Before deploying to production:

- [x] PostHog initialized in app layout
- [x] Environment variables configured locally
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` to production hosting provider
- [ ] Add `NEXT_PUBLIC_POSTHOG_HOST` to production hosting provider
- [ ] Test events in production PostHog dashboard
- [ ] Set up PostHog dashboards for key metrics
- [ ] Configure PostHog alerts for important events
- [ ] Review and clean up any debug/console.log statements

## Troubleshooting

### Events not showing up in PostHog?

1. **Check the browser console** - Look for PostHog errors
2. **Check Network tab** - Are requests to `/ingest/batch` succeeding?
3. **Wait 1-2 minutes** - PostHog has a small delay in displaying events
4. **Check environment variables** - Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set
5. **Check PostHog project** - Make sure you're looking at the correct project

### PostHog not initializing?

1. **Check Next.js layout** - PostHogProvider should wrap your app
2. **Check for errors** - Browser console will show initialization errors
3. **Verify API key** - Check that the key starts with `phc_`
4. **Check network** - Ensure `/ingest` endpoint is accessible

### Ad blockers blocking PostHog?

The `/ingest` proxy should prevent this, but some strict blockers may still block it. Users with those blockers won't be tracked (which is their choice).

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Next.js Guide](https://posthog.com/docs/libraries/next-js)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog Session Recording](https://posthog.com/docs/session-replay)
- [PostHog Dashboards](https://posthog.com/docs/product-analytics/dashboards)

## Support

If you need help:
1. Check PostHog documentation
2. Join PostHog Slack community
3. Review the code in the files mentioned above
4. Check browser console for errors
