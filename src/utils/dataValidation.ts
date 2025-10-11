import { SearchResult } from '@/types/search';

/**
 * Safely access nested properties with fallback
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validate and format business hours
 */
export function formatBusinessHours(businessHours: any): string | null {
  if (!businessHours) return null;
  
  try {
    if (typeof businessHours === 'string') {
      businessHours = JSON.parse(businessHours);
    }
    
    if (typeof businessHours === 'object' && Object.keys(businessHours).length > 0) {
      return JSON.stringify(businessHours);
    }
  } catch (error) {
    console.error('Error parsing business hours:', error);
  }
  
  return null;
}

/**
 * Get display text for business hours by day
 */
export function getBusinessHoursDisplay(businessHours: any, day: string): string {
  try {
    let hours = businessHours;
    if (typeof businessHours === 'string') {
      hours = JSON.parse(businessHours);
    }
    
    if (hours && typeof hours === 'object' && hours[day]) {
      return hours[day];
    }
  } catch (error) {
    console.error('Error getting business hours for day:', error);
  }
  
  return 'Contact vendor';
}

/**
 * Validate price range
 */
export function getPriceRangeDisplay(priceRange?: string): string {
  if (!priceRange || priceRange.trim() === '') {
    return 'Contact for pricing';
  }
  return priceRange;
}

/**
 * Validate and get service area display
 */
export function getServiceAreaDisplay(vendor: Partial<SearchResult>): string {
  if (vendor.service_area && Array.isArray(vendor.service_area) && vendor.service_area.length > 0) {
    return vendor.service_area.join(', ');
  }
  
  if (vendor.city && vendor.state) {
    return `${vendor.city}, ${vendor.state}`;
  }
  
  if (vendor.city) {
    return vendor.city;
  }
  
  return 'Contact vendor for service area';
}

/**
 * Validate rating object
 */
export function isValidRating(rating: any): boolean {
  return (
    rating &&
    typeof rating === 'object' &&
    typeof rating.value === 'number' &&
    rating.value > 0 &&
    rating.value <= 5
  );
}

/**
 * Safely get rating value
 */
export function getRatingValue(rating: any): number | null {
  if (isValidRating(rating)) {
    return rating.value;
  }
  return null;
}

/**
 * Safely get rating count
 */
export function getRatingCount(rating: any): number {
  if (!rating || typeof rating !== 'object') return 0;
  
  return rating.votes_count || rating.count || 0;
}

/**
 * Validate phone number
 */
export function isValidPhone(phone?: string): boolean {
  if (!phone) return false;
  // Basic validation - has at least 10 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Validate email
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url?: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get fallback message for missing data
 */
export function getFallbackMessage(dataType: string): string {
  const fallbacks: Record<string, string> = {
    phone: 'Contact information not available',
    email: 'Email not available',
    address: 'Address not available',
    hours: 'Contact vendor for hours',
    price: 'Contact for pricing',
    description: 'No description available',
    teamSize: 'Contact vendor for details',
  };
  
  return fallbacks[dataType] || 'Information not available';
}

/**
 * Validate vendor has minimum required data
 */
export function hasMinimumVendorData(vendor: Partial<SearchResult>): boolean {
  return !!(vendor.title && (vendor.phone || vendor.email || vendor.url));
}

/**
 * Get contact methods available for vendor
 */
export function getAvailableContactMethods(vendor: Partial<SearchResult>): string[] {
  const methods: string[] = [];
  
  if (isValidPhone(vendor.phone)) methods.push('phone');
  if (isValidEmail(vendor.email)) methods.push('email');
  if (isValidUrl(vendor.url)) methods.push('website');
  if (vendor.instagram) methods.push('instagram');
  if (vendor.facebook) methods.push('facebook');
  
  return methods;
}

/**
 * Format address for display
 */
export function formatAddress(vendor: Partial<SearchResult>): string | null {
  if (vendor.address) return vendor.address;
  
  const parts: string[] = [];
  if (vendor.city) parts.push(vendor.city);
  if (vendor.state) parts.push(vendor.state);
  if (vendor.postal_code) parts.push(vendor.postal_code);
  
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Check if vendor has images
 */
export function hasValidImages(vendor: Partial<SearchResult>): boolean {
  if (vendor.main_image && vendor.main_image.trim() !== '') return true;
  if (vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0) return true;
  return false;
}

/**
 * Get first valid image from vendor
 */
export function getFirstValidImage(vendor: Partial<SearchResult>): string | null {
  if (vendor.main_image && vendor.main_image.trim() !== '') return vendor.main_image;
  if (vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0) {
    return vendor.images[0];
  }
  return null;
}
