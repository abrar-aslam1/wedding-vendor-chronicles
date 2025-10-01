/**
 * Match Me Feature - TypeScript Types
 * 
 * Type definitions for the vendor matching system
 */

// Quiz data structure
export interface QuizData {
  // Core filters (Step 1)
  location: {
    city: string;
    state: string;
    radius_miles: number;
  };
  date?: Date;
  date_flexible: boolean;
  date_season?: 'spring' | 'summer' | 'fall' | 'winter';
  guest_count_band: '0-50' | '50-100' | '100-150' | '150-200' | '200+';
  categories: string[];
  budget_mode: 'overall' | 'per_category';
  budget_overall?: number;
  budget_by_category?: Record<string, number>;
  style_vibe: string[];
  
  // Optional toggles (Step 2)
  cultural_needs?: string[];
  language_mc?: string[];
  accessibility?: string[];
  venue_type?: 'indoor' | 'outdoor' | 'both_with_backup';
  alcohol_policy?: 'byo' | 'bar_packages' | 'dry';
  travel_willingness?: 'local_only' | 'statewide' | 'destination';
  
  // Category-specific filters (Step 3)
  category_filters?: Record<string, any>;
}

// Vendor projection structure
export interface VendorProjection {
  vendor_id: string;
  category: string;
  city: string;
  state: string;
  business_name: string;
  
  // Pricing
  price_tier: 'budget' | 'moderate' | 'premium' | 'luxury' | 'undisclosed';
  starting_price?: number;
  price_range_min?: number;
  price_range_max?: number;
  
  // Capacity
  typical_capacity_min?: number;
  typical_capacity_max?: number;
  books_months_advance: number;
  
  // Style & features
  style_keywords: string[];
  features: Record<string, any>;
  description: string;
  
  // Social proof
  review_avg?: number;
  review_count: number;
  verification_badges: string[];
  response_time_hours: number;
  
  // Cultural/accessibility
  cultural_specialties: string[];
  accessibility_features: string[];
  languages_supported: string[];
  
  // Contact
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  images: string[];
  
  // Metadata
  active: boolean;
  last_synced: string;
}

// Match result
export interface MatchResult {
  score: number; // 0-100
  rationale: string[]; // Top 3 reasons
  score_breakdown: ScoreBreakdown;
}

// Detailed score breakdown
export interface ScoreBreakdown {
  category_match: number; // 25 points
  location_proximity: number; // 20 points
  budget_alignment: number; // 20 points
  style_match: number; // 15 points
  availability: number; // 10 points
  social_proof: number; // 10 points
  total: number; // Sum of above
}

// Scoring weights (configurable)
export interface ScoringWeights {
  category_match: number;
  location_proximity: number;
  budget_alignment: number;
  style_match: number;
  availability: number;
  social_proof: number;
}

// Default scoring weights
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  category_match: 25,
  location_proximity: 20,
  budget_alignment: 20,
  style_match: 15,
  availability: 10,
  social_proof: 10
};

// Match request record (for API)
export interface MatchRequest {
  id: string;
  user_id?: string;
  session_id: string;
  quiz_data: QuizData;
  created_at: string;
  quiz_completion_time_seconds?: number;
}

// Match result record (for API)
export interface MatchResultRecord {
  id: string;
  request_id: string;
  vendor_id: string;
  category: string;
  score: number;
  rank_in_category: number;
  rationale: string[];
  score_breakdown: ScoreBreakdown;
  
  // Denormalized fields
  vendor_name: string;
  starting_price?: string;
  badges: string[];
  review_avg?: number;
  review_count: number;
  response_time_sla: string;
  availability_signal: 'likely_available' | 'check_availability' | 'limited_availability';
  
  created_at: string;
}

// API response types
export interface MatchResultsResponse {
  request_id: string;
  created_at: string;
  quiz_summary: {
    location: string;
    date?: string;
    categories: string[];
    guest_count: string;
  };
  results_by_category: Record<string, VendorMatchCard[]>;
  shareable_link: string;
  inquiries_remaining: number;
}

export interface VendorMatchCard {
  vendor_id: string;
  name: string;
  category: string;
  starting_price: string;
  badges: string[];
  review_avg?: number;
  review_count: number;
  score: number;
  rationale: string[];
  response_time_sla: string;
  availability_signal: string;
}

// Rate limit record
export interface RateLimit {
  id: string;
  request_id: string;
  inquiries_sent: number;
  max_inquiries: number;
  vendors_contacted: string[];
  last_inquiry_at?: string;
  updated_at: string;
}

// Analytics event
export interface MatchAnalyticsEvent {
  event_type: string;
  request_id?: string;
  vendor_id?: string;
  session_id?: string;
  user_id?: string;
  event_data: Record<string, any>;
  created_at: string;
}
