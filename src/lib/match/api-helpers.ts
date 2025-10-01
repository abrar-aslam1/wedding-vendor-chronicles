/**
 * Match Me Feature - API Helper Functions
 * 
 * Shared utilities for API routes
 */

import { createClient } from '@supabase/supabase-js';
import type { QuizData, VendorProjection } from './types';

/**
 * Check if matching feature is enabled
 */
export function isMatchingEnabled(): boolean {
  return import.meta.env.NEXT_PUBLIC_ENABLE_MATCHING === 'true';
}

/**
 * Get max results per category from env
 */
export function getMaxResultsPerCategory(): number {
  const envValue = import.meta.env.MATCH_MAX_RESULTS_PER_CATEGORY;
  return envValue ? parseInt(envValue) : 10;
}

/**
 * Get max inquiries per request from env
 */
export function getMaxInquiriesPerRequest(): number {
  const envValue = import.meta.env.MATCH_MAX_INQUIRIES_PER_REQUEST;
  return envValue ? parseInt(envValue) : 5;
}

/**
 * Create Supabase client for server-side operations
 */
export function createServerSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Generate session ID for anonymous users
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Validate quiz data structure
 */
export function validateQuizData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.location?.city) errors.push('Location city is required');
  if (!data.location?.state) errors.push('Location state is required');
  if (!data.guest_count_band) errors.push('Guest count is required');
  if (!data.categories || data.categories.length === 0) {
    errors.push('At least one category is required');
  }
  if (!data.budget_mode) errors.push('Budget mode is required');
  if (!data.style_vibe || data.style_vibe.length === 0) {
    errors.push('At least one style preference is required');
  }

  // Validate guest count band
  const validGuestBands = ['0-50', '50-100', '100-150', '150-200', '200+'];
  if (data.guest_count_band && !validGuestBands.includes(data.guest_count_band)) {
    errors.push('Invalid guest count band');
  }

  // Validate budget mode
  const validBudgetModes = ['overall', 'per_category'];
  if (data.budget_mode && !validBudgetModes.includes(data.budget_mode)) {
    errors.push('Invalid budget mode');
  }

  // Budget validation
  if (data.budget_mode === 'overall' && !data.budget_overall) {
    errors.push('Overall budget is required when budget_mode is "overall"');
  }
  if (data.budget_mode === 'per_category' && !data.budget_by_category) {
    errors.push('Per-category budget is required when budget_mode is "per_category"');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format price for display
 */
export function formatPrice(vendor: VendorProjection): string {
  if (vendor.starting_price) {
    return `$${vendor.starting_price.toLocaleString()}+`;
  }
  
  if (vendor.price_range_min && vendor.price_range_max) {
    return `$${vendor.price_range_min.toLocaleString()} - $${vendor.price_range_max.toLocaleString()}`;
  }
  
  // Fallback to tier-based description
  const tierDescriptions: Record<string, string> = {
    'budget': '$-$$',
    'moderate': '$$-$$$',
    'premium': '$$$-$$$$',
    'luxury': '$$$$+',
    'undisclosed': 'Contact for pricing'
  };
  
  return tierDescriptions[vendor.price_tier] || 'Contact for pricing';
}

/**
 * Determine availability signal based on vendor data
 */
export function getAvailabilitySignal(
  quiz: QuizData,
  vendor: VendorProjection
): 'likely_available' | 'check_availability' | 'limited_availability' {
  if (!quiz.date) {
    return 'check_availability';
  }

  const today = new Date();
  const weddingDate = new Date(quiz.date);
  const monthsUntilWedding = (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsUntilWedding < 3) {
    return 'limited_availability';
  } else if (monthsUntilWedding < vendor.books_months_advance) {
    return 'likely_available';
  } else {
    return 'check_availability';
  }
}

/**
 * Format response time SLA
 */
export function getResponseTimeSLA(vendor: VendorProjection): string {
  if (!vendor.response_time_hours) {
    return 'Typically responds in 24-48 hours';
  }

  if (vendor.response_time_hours <= 1) {
    return 'Typically responds within 1 hour';
  } else if (vendor.response_time_hours <= 24) {
    return `Typically responds within ${vendor.response_time_hours} hours`;
  } else {
    const days = Math.round(vendor.response_time_hours / 24);
    return `Typically responds within ${days} ${days === 1 ? 'day' : 'days'}`;
  }
}

/**
 * Log error with context
 */
export function logMatchError(
  context: string,
  error: any,
  additionalData?: Record<string, any>
) {
  console.error(`[Match API Error - ${context}]`, {
    error: error.message || error,
    stack: error.stack,
    ...additionalData
  });
}

/**
 * Create soft-fail response
 */
export function createSoftFailResponse(reason: string, fallbackPath: string = '/search') {
  return {
    success: false,
    reason,
    fallback: fallbackPath,
    message: 'Unable to process match request. Please try browsing vendors directly.'
  };
}
