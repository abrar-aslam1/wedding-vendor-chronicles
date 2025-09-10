import { SearchResult } from "@/types/search";

export type PriceTier = '$' | '$$' | '$$$' | '$$$$';

/**
 * Convert price range or other pricing data to tier symbols
 */
export const getPriceTier = (vendor: SearchResult): PriceTier => {
  // Check if vendor already has price_tier field
  if (vendor.price_tier && ['$', '$$', '$$$', '$$$$'].includes(vendor.price_tier)) {
    return vendor.price_tier as PriceTier;
  }

  // Fallback logic based on price_range or other data
  const priceRange = vendor.price_range?.toLowerCase() || '';
  
  if (priceRange.includes('expensive') || priceRange.includes('high') || priceRange.includes('luxury')) {
    return '$$$$';
  }
  if (priceRange.includes('moderate') || priceRange.includes('medium') || priceRange.includes('mid')) {
    return '$$$';
  }
  if (priceRange.includes('affordable') || priceRange.includes('budget') || priceRange.includes('low')) {
    return '$$';
  }
  
  // Default based on category
  const category = vendor.category?.toLowerCase() || '';
  if (category.includes('venue') || category.includes('planner')) {
    return '$$$'; // Venues and planners tend to be higher tier
  }
  
  return '$$'; // Default middle tier
};

/**
 * Get key differentiator text for vendor
 */
export const getKeyDifferentiator = (vendor: SearchResult): string => {
  // Check if vendor already has key_differentiator field
  if (vendor.key_differentiator) {
    return vendor.key_differentiator;
  }

  // Generate based on response_time
  const responseTime = vendor.response_time?.toLowerCase() || '';
  if (responseTime === 'fast') {
    return '24-hr response';
  }
  if (responseTime === 'medium') {
    return '48-hr response';
  }

  // Generate based on turnaround_time
  const turnaroundTime = vendor.turnaround_time?.toLowerCase() || '';
  if (turnaroundTime?.includes('same day') || turnaroundTime?.includes('24')) {
    return 'Same-day delivery';
  }
  if (turnaroundTime?.includes('48') || turnaroundTime?.includes('2 day')) {
    return '48-hr preview';
  }

  // Generate based on rating
  const rating = vendor.rating;
  if (rating && typeof rating === 'object' && rating.value >= 4.8) {
    return '5-star rated';
  }

  // Generate based on category
  const category = vendor.category?.toLowerCase() || '';
  if (category.includes('photographer')) {
    return 'Quick turnaround';
  }
  if (category.includes('venue')) {
    return 'Flexible booking';
  }
  if (category.includes('planner')) {
    return 'Full-service planning';
  }
  if (category.includes('florist')) {
    return 'Custom arrangements';
  }
  if (category.includes('caterer')) {
    return 'Menu customization';
  }

  return 'Professional service';
};

/**
 * Get style tags for vendor (limit to 3)
 */
export const getStyleTags = (vendor: SearchResult, subcategory?: string): string[] => {
  const tags: string[] = [];

  // Add subcategory as first tag if available
  if (subcategory) {
    tags.push(subcategory.charAt(0).toUpperCase() + subcategory.slice(1));
  }

  // Add category-specific tags
  const category = vendor.category?.toLowerCase() || '';
  
  if (category.includes('photographer')) {
    if (!tags.some(tag => tag.toLowerCase().includes('style'))) {
      tags.push('Modern Style', 'Portrait Expert');
    }
  } else if (category.includes('venue')) {
    tags.push('Indoor/Outdoor', 'Full Service');
  } else if (category.includes('caterer')) {
    if (!tags.some(tag => tag.toLowerCase().includes('cuisine'))) {
      tags.push('Custom Menu', 'Dietary Options');
    }
  } else if (category.includes('florist')) {
    if (!tags.some(tag => tag.toLowerCase().includes('style'))) {
      tags.push('Bridal Bouquets', 'Centerpieces');
    }
  } else if (category.includes('planner')) {
    tags.push('Full Planning', 'Day-of Coordination');
  } else {
    tags.push('Professional', 'Experienced');
  }

  // Add rating-based tag if high rating
  const rating = vendor.rating;
  if (rating && typeof rating === 'object' && rating.value >= 4.5) {
    tags.push('Top Rated');
  }

  // Limit to 3 tags
  return tags.slice(0, 3);
};

/**
 * Format price tier for display
 */
export const formatPriceTier = (tier: PriceTier): string => {
  return tier;
};

/**
 * Get price tier color class for styling
 */
export const getPriceTierColor = (tier: PriceTier): string => {
  switch (tier) {
    case '$':
      return 'text-green-600 bg-green-50';
    case '$$':
      return 'text-blue-600 bg-blue-50';
    case '$$$':
      return 'text-purple-600 bg-purple-50';
    case '$$$$':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Enhanced analytics tracking for vendor interactions
 */
export const trackVendorClick = async (
  vendor: SearchResult,
  ctaType: 'check_availability' | 'view_profile' | 'visit_site' | 'call' | 'email' | 'save',
  position?: number
) => {
  try {
    // Get current page info
    const path = window.location.pathname;
    const category = vendor.category || 'unknown';
    const city = vendor.city || 'unknown';
    
    // Track with GA4 if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'vendor_click', {
        vendor_slug: vendor.place_id || vendor.title?.toLowerCase().replace(/\s+/g, '-'),
        category: category,
        city: city,
        rank_position: position || 0,
        cta_type: ctaType,
        page_path: path
      });
    }

    // Also track in Supabase analytics
    const response = await fetch('/api/track-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: vendor.place_id,
        eventType: 'vendor_click',
        eventData: {
          cta_type: ctaType,
          category: category,
          city: city,
          rank_position: position || 0
        }
      })
    });

    if (!response.ok) {
      console.warn('Failed to track vendor click analytics');
    }
  } catch (error) {
    console.error('Error tracking vendor click:', error);
  }
};
