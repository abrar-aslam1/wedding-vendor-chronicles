import posthog from "posthog-js";

/**
 * Analytics utility functions for tracking user interactions with PostHog
 *
 * Usage examples:
 * - Track page views: trackPageView('/vendors/photography')
 * - Track vendor interactions: trackVendorView('vendor-123', 'Photography')
 * - Track searches: trackSearch('wedding photographers', { location: 'New York' })
 * - Track conversions: trackLeadSubmitted('vendor-456', 'contact_form')
 */

// Page tracking
export const trackPageView = (pagePath: string, properties?: Record<string, any>) => {
  posthog.capture('$pageview', {
    $current_url: pagePath,
    ...properties,
  });
};

// Vendor interactions
export const trackVendorView = (vendorId: string, category: string, properties?: Record<string, any>) => {
  posthog.capture('vendor_viewed', {
    vendor_id: vendorId,
    vendor_category: category,
    ...properties,
  });
};

export const trackVendorContact = (vendorId: string, contactMethod: 'email' | 'phone' | 'form' | 'website') => {
  posthog.capture('vendor_contacted', {
    vendor_id: vendorId,
    contact_method: contactMethod,
  });
};

export const trackVendorFavorite = (vendorId: string, action: 'add' | 'remove') => {
  posthog.capture('vendor_favorited', {
    vendor_id: vendorId,
    action,
  });
};

// Search tracking
export const trackSearch = (query: string, properties?: Record<string, any>) => {
  posthog.capture('search_performed', {
    search_query: query,
    ...properties,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string | string[]) => {
  posthog.capture('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Lead generation
export const trackLeadSubmitted = (vendorId: string, formType: string) => {
  posthog.capture('lead_submitted', {
    vendor_id: vendorId,
    form_type: formType,
  });
};

// Vendor dashboard events
export const trackVendorDashboardAction = (action: string, properties?: Record<string, any>) => {
  posthog.capture('vendor_dashboard_action', {
    action,
    ...properties,
  });
};

export const trackVendorProfileUpdate = (updateType: string, fields: string[]) => {
  posthog.capture('vendor_profile_updated', {
    update_type: updateType,
    fields_updated: fields,
  });
};

// Engagement tracking
export const trackReviewSubmitted = (vendorId: string, rating: number) => {
  posthog.capture('review_submitted', {
    vendor_id: vendorId,
    rating,
  });
};

export const trackGalleryImageView = (vendorId: string, imageId: string) => {
  posthog.capture('gallery_image_viewed', {
    vendor_id: vendorId,
    image_id: imageId,
  });
};

// User preferences
export const trackPreferencesUpdated = (preferenceType: string, value: any) => {
  posthog.capture('preferences_updated', {
    preference_type: preferenceType,
    value,
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) => {
  posthog.capture('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
};

// Feature flags helper (if you use PostHog feature flags)
export const getFeatureFlag = (flagKey: string): boolean | string | undefined => {
  return posthog.getFeatureFlag(flagKey);
};

export const isFeatureEnabled = (flagKey: string): boolean => {
  return posthog.isFeatureEnabled(flagKey);
};
