/**
 * Google Analytics Event Tracking Utilities
 * 
 * These functions send custom events to Google Analytics via gtag.
 * Make sure GTM is properly installed in app/layout.tsx
 */

// Declare gtag on window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track when a vendor signs up/creates a listing
 */
export const trackVendorSignup = (params: {
  vendor_category: string;
  vendor_city: string;
  vendor_state: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'vendor_listing_signup', {
      vendor_category: params.vendor_category,
      vendor_city: params.vendor_city,
      vendor_state: params.vendor_state
    });
  }
};

/**
 * Track when a user clicks to contact a vendor
 */
export const trackVendorContactClick = (params: {
  vendor_name: string;
  vendor_category: string;
  vendor_city: string;
  vendor_state: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'vendor_contact_click', {
      vendor_name: params.vendor_name,
      vendor_category: params.vendor_category,
      vendor_city: params.vendor_city,
      vendor_state: params.vendor_state
    });
  }
};

/**
 * Track when a user browses a category
 */
export const trackCategoryBrowse = (params: {
  category: string;
  state?: string;
  city?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'category_browse', {
      category: params.category,
      state: params.state || 'all',
      city: params.city || 'all'
    });
  }
};

/**
 * Track when a user views a vendor profile
 */
export const trackVendorView = (params: {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'vendor_profile_view', {
      vendor_id: params.vendor_id,
      vendor_name: params.vendor_name,
      vendor_category: params.vendor_category
    });
  }
};

/**
 * Track search queries
 */
export const trackSearch = (params: {
  search_term?: string;
  category?: string;
  location?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: params.search_term || '',
      category: params.category || 'all',
      location: params.location || 'all'
    });
  }
};
