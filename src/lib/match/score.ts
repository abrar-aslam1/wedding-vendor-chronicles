/**
 * Match Me Feature - Scoring Algorithm
 * 
 * Pure, testable function to calculate vendor match scores
 * Based on weighted scoring across 6 dimensions
 */

import type {
  QuizData,
  VendorProjection,
  MatchResult,
  ScoreBreakdown,
  ScoringWeights
} from './types';
import { DEFAULT_SCORING_WEIGHTS } from './types';

/**
 * Calculate distance between two cities (simplified Haversine approximation)
 * Returns distance in miles
 */
function calculateDistance(
  city1: string,
  state1: string,
  city2: string,
  state2: string
): number {
  // If same city, distance is 0
  if (city1.toLowerCase() === city2.toLowerCase() && 
      state1.toLowerCase() === state2.toLowerCase()) {
    return 0;
  }
  
  // If same state but different city, estimate ~50 miles
  if (state1.toLowerCase() === state2.toLowerCase()) {
    return 50;
  }
  
  // Different state, estimate ~200 miles
  return 200;
}

/**
 * Calculate location proximity score (0-20 points)
 */
function calculateLocationScore(
  quiz: QuizData,
  vendor: VendorProjection,
  maxPoints: number
): number {
  const distance = calculateDistance(
    quiz.location.city,
    quiz.location.state,
    vendor.city,
    vendor.state
  );
  
  const radiusMiles = quiz.location.radius_miles;
  
  // Perfect match: same city
  if (distance === 0) {
    return maxPoints;
  }
  
  // Within radius: scale score based on distance
  if (distance <= radiusMiles) {
    const score = maxPoints * (1 - (distance / radiusMiles) * 0.5);
    return Math.round(score);
  }
  
  // Just outside radius: partial credit
  if (distance <= radiusMiles * 1.5) {
    return Math.round(maxPoints * 0.3);
  }
  
  // Too far: no points
  return 0;
}

/**
 * Calculate budget alignment score (0-20 points)
 */
function calculateBudgetScore(
  quiz: QuizData,
  vendor: VendorProjection,
  maxPoints: number
): number {
  // Get budget for this vendor's category
  let targetBudget: number | undefined;
  
  if (quiz.budget_mode === 'per_category' && quiz.budget_by_category) {
    targetBudget = quiz.budget_by_category[vendor.category];
  } else if (quiz.budget_mode === 'overall' && quiz.budget_overall) {
    // Estimate category budget as % of overall (rough heuristic)
    const categoryMultipliers: Record<string, number> = {
      'venue': 0.35,
      'photographer': 0.10,
      'videographer': 0.10,
      'catering': 0.25,
      'florist': 0.08,
      'dj': 0.05,
      'band': 0.08,
      'planner': 0.12,
      'hair-makeup': 0.04,
      'transportation': 0.03,
      'default': 0.10
    };
    
    const multiplier = categoryMultipliers[vendor.category] || categoryMultipliers['default'];
    targetBudget = quiz.budget_overall * multiplier;
  }
  
  if (!targetBudget) {
    // No budget specified, give partial credit
    return Math.round(maxPoints * 0.5);
  }
  
  // Map price tiers to approximate ranges
  const tierRanges: Record<string, { min: number; max: number }> = {
    'budget': { min: 0, max: targetBudget * 0.7 },
    'moderate': { min: targetBudget * 0.6, max: targetBudget * 1.2 },
    'premium': { min: targetBudget * 1.0, max: targetBudget * 1.8 },
    'luxury': { min: targetBudget * 1.5, max: targetBudget * 3.0 },
    'undisclosed': { min: targetBudget * 0.5, max: targetBudget * 1.5 }
  };
  
  const vendorRange = tierRanges[vendor.price_tier] || tierRanges['moderate'];
  
  // Check if budget overlaps with vendor range
  if (targetBudget >= vendorRange.min && targetBudget <= vendorRange.max) {
    // Within range: full points
    return maxPoints;
  } else if (targetBudget < vendorRange.min) {
    // Budget too low: scale down
    const gap = vendorRange.min - targetBudget;
    const score = maxPoints * Math.max(0, 1 - (gap / targetBudget));
    return Math.round(score);
  } else {
    // Budget higher than vendor range: still good (vendor might be affordable)
    return Math.round(maxPoints * 0.8);
  }
}

/**
 * Calculate style match score (0-15 points)
 */
function calculateStyleScore(
  quizStyles: string[],
  vendorKeywords: string[],
  maxPoints: number
): number {
  if (!quizStyles || quizStyles.length === 0) {
    // No style preferences, give partial credit
    return Math.round(maxPoints * 0.5);
  }
  
  if (!vendorKeywords || vendorKeywords.length === 0) {
    // Vendor has no keywords, give partial credit
    return Math.round(maxPoints * 0.4);
  }
  
  // Normalize strings for comparison
  const normalizedQuiz = quizStyles.map(s => s.toLowerCase().trim());
  const normalizedVendor = vendorKeywords.map(s => s.toLowerCase().trim());
  
  // Count matches
  const matches = normalizedQuiz.filter(style => 
    normalizedVendor.includes(style)
  ).length;
  
  if (matches === 0) {
    // No matches: minimal points
    return Math.round(maxPoints * 0.2);
  }
  
  // Scale based on match ratio
  const matchRatio = matches / normalizedQuiz.length;
  return Math.round(maxPoints * matchRatio);
}

/**
 * Calculate availability score (0-10 points)
 */
function calculateAvailabilityScore(
  quiz: QuizData,
  vendor: VendorProjection,
  maxPoints: number
): number {
  // If no date specified, assume available
  if (!quiz.date && !quiz.date_season) {
    return Math.round(maxPoints * 0.7);
  }
  
  // Check booking advance time
  if (quiz.date) {
    const today = new Date();
    const weddingDate = new Date(quiz.date);
    const monthsUntilWedding = (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsUntilWedding < 0) {
      // Date in past
      return 0;
    }
    
    if (monthsUntilWedding < vendor.books_months_advance) {
      // Within booking window: full points
      return maxPoints;
    } else {
      // Further out: still good, slight reduction
      return Math.round(maxPoints * 0.8);
    }
  }
  
  // Season-based availability (simplified)
  return Math.round(maxPoints * 0.6);
}

/**
 * Calculate social proof score (0-10 points)
 */
function calculateSocialProofScore(
  vendor: VendorProjection,
  maxPoints: number
): number {
  let score = 0;
  
  // Review average (0-5 points)
  if (vendor.review_avg) {
    score += (vendor.review_avg / 5.0) * 5;
  }
  
  // Review count (0-3 points)
  if (vendor.review_count >= 100) {
    score += 3;
  } else if (vendor.review_count >= 50) {
    score += 2;
  } else if (vendor.review_count >= 10) {
    score += 1;
  }
  
  // Verification badges (0-2 points)
  if (vendor.verification_badges.includes('verified')) {
    score += 1;
  }
  if (vendor.verification_badges.includes('featured') || 
      vendor.verification_badges.includes('premium_vendor')) {
    score += 1;
  }
  
  return Math.min(Math.round(score), maxPoints);
}

/**
 * Check if vendor meets cultural requirements (deal-breaker)
 */
function checkCulturalMatch(quiz: QuizData, vendor: VendorProjection): boolean {
  if (!quiz.cultural_needs || quiz.cultural_needs.length === 0) {
    return true; // No requirements
  }
  
  if (!vendor.cultural_specialties || vendor.cultural_specialties.length === 0) {
    return false; // Requirements but vendor has no specialties
  }
  
  // Normalize for comparison
  const normalizedNeeds = quiz.cultural_needs.map(s => s.toLowerCase().trim());
  const normalizedSpecialties = vendor.cultural_specialties.map(s => s.toLowerCase().trim());
  
  // Check if at least one need is met
  return normalizedNeeds.some(need => 
    normalizedSpecialties.some(specialty => 
      specialty.includes(need) || need.includes(specialty)
    )
  );
}

/**
 * Check if vendor meets accessibility requirements (deal-breaker)
 */
function checkAccessibilityMatch(quiz: QuizData, vendor: VendorProjection): boolean {
  if (!quiz.accessibility || quiz.accessibility.length === 0) {
    return true; // No requirements
  }
  
  if (!vendor.accessibility_features || vendor.accessibility_features.length === 0) {
    return false; // Requirements but vendor has no features
  }
  
  // Normalize for comparison
  const normalizedNeeds = quiz.accessibility.map(s => s.toLowerCase().trim());
  const normalizedFeatures = vendor.accessibility_features.map(s => s.toLowerCase().trim());
  
  // All accessibility needs must be met
  return normalizedNeeds.every(need => 
    normalizedFeatures.some(feature => 
      feature.includes(need) || need.includes(feature)
    )
  );
}

/**
 * Check guest count compatibility
 */
function checkGuestCountMatch(quiz: QuizData, vendor: VendorProjection): boolean {
  // Only relevant for venues
  if (vendor.category !== 'venue') {
    return true;
  }
  
  if (!vendor.typical_capacity_min && !vendor.typical_capacity_max) {
    return true; // No capacity data
  }
  
  // Parse guest count band
  const guestRanges: Record<string, { min: number; max: number }> = {
    '0-50': { min: 0, max: 50 },
    '50-100': { min: 50, max: 100 },
    '100-150': { min: 100, max: 150 },
    '150-200': { min: 150, max: 200 },
    '200+': { min: 200, max: 1000 }
  };
  
  const guestRange = guestRanges[quiz.guest_count_band];
  if (!guestRange) return true;
  
  // Check if there's overlap
  const minGuests = guestRange.min;
  const maxGuests = guestRange.max;
  
  if (vendor.typical_capacity_min && maxGuests < vendor.typical_capacity_min) {
    return false; // Too few guests
  }
  
  if (vendor.typical_capacity_max && minGuests > vendor.typical_capacity_max) {
    return false; // Too many guests
  }
  
  return true;
}

/**
 * Generate rationale bullets based on scoring
 */
function generateRationale(
  quiz: QuizData,
  vendor: VendorProjection,
  breakdown: ScoreBreakdown
): string[] {
  const rationale: string[] = [];
  
  // Location (if high score)
  if (breakdown.location_proximity >= 15) {
    if (vendor.city.toLowerCase() === quiz.location.city.toLowerCase()) {
      rationale.push('Perfect location match');
    } else {
      rationale.push('Great location match');
    }
  } else if (breakdown.location_proximity >= 10) {
    rationale.push('Good travel distance');
  }
  
  // Budget (if high score)
  if (breakdown.budget_alignment >= 15) {
    rationale.push('Perfect price fit');
  } else if (breakdown.budget_alignment >= 10) {
    rationale.push('Within budget range');
  }
  
  // Style (if high score)
  if (breakdown.style_match >= 10 && quiz.style_vibe && quiz.style_vibe.length > 0) {
    rationale.push(`Matches your ${quiz.style_vibe[0]} style`);
  }
  
  // Social proof
  if (vendor.verification_badges.includes('verified')) {
    rationale.push('Verified vendor');
  }
  
  if (vendor.review_avg && vendor.review_avg >= 4.5) {
    rationale.push(`Highly rated (${vendor.review_avg.toFixed(1)}★)`);
  } else if (vendor.review_avg && vendor.review_avg >= 4.0 && vendor.review_count >= 20) {
    rationale.push(`Well reviewed (${vendor.review_count} reviews)`);
  }
  
  // Cultural match
  if (quiz.cultural_needs && quiz.cultural_needs.length > 0 && 
      vendor.cultural_specialties && vendor.cultural_specialties.length > 0) {
    rationale.push('Meets cultural requirements');
  }
  
  // Experience indicators
  if (vendor.review_count >= 50) {
    rationale.push('Experienced vendor');
  }
  
  // Return top 3
  return rationale.slice(0, 3);
}

/**
 * Main scoring function
 * 
 * @param quiz - Quiz data from the couple
 * @param vendor - Vendor projection to score
 * @param weights - Optional custom scoring weights
 * @returns Match result with score, rationale, and breakdown
 */
export function calculateMatch(
  quiz: QuizData,
  vendor: VendorProjection,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): MatchResult {
  // Initialize breakdown
  const breakdown: ScoreBreakdown = {
    category_match: 0,
    location_proximity: 0,
    budget_alignment: 0,
    style_match: 0,
    availability: 0,
    social_proof: 0,
    total: 0
  };
  
  // 1. Category Match (HARD REQUIREMENT)
  if (!quiz.categories.includes(vendor.category)) {
    return {
      score: 0,
      rationale: ['Not in selected categories'],
      score_breakdown: breakdown
    };
  }
  breakdown.category_match = weights.category_match;
  
  // 2. Deal-breakers (HARD REQUIREMENTS)
  if (quiz.cultural_needs && quiz.cultural_needs.length > 0) {
    if (!checkCulturalMatch(quiz, vendor)) {
      return {
        score: 0,
        rationale: ['Does not meet cultural requirements'],
        score_breakdown: breakdown
      };
    }
  }
  
  if (quiz.accessibility && quiz.accessibility.length > 0) {
    if (!checkAccessibilityMatch(quiz, vendor)) {
      return {
        score: 0,
        rationale: ['Does not meet accessibility needs'],
        score_breakdown: breakdown
      };
    }
  }
  
  if (!checkGuestCountMatch(quiz, vendor)) {
    return {
      score: 0,
      rationale: ['Capacity does not match guest count'],
      score_breakdown: breakdown
    };
  }
  
  // 3. Calculate scores for each dimension
  breakdown.location_proximity = calculateLocationScore(
    quiz, 
    vendor, 
    weights.location_proximity
  );
  
  breakdown.budget_alignment = calculateBudgetScore(
    quiz, 
    vendor, 
    weights.budget_alignment
  );
  
  breakdown.style_match = calculateStyleScore(
    quiz.style_vibe, 
    vendor.style_keywords, 
    weights.style_match
  );
  
  breakdown.availability = calculateAvailabilityScore(
    quiz, 
    vendor, 
    weights.availability
  );
  
  breakdown.social_proof = calculateSocialProofScore(
    vendor, 
    weights.social_proof
  );
  
  // 4. Calculate total score
  breakdown.total = 
    breakdown.category_match +
    breakdown.location_proximity +
    breakdown.budget_alignment +
    breakdown.style_match +
    breakdown.availability +
    breakdown.social_proof;
  
  // 5. Generate rationale
  const rationale = generateRationale(quiz, vendor, breakdown);
  
  return {
    score: breakdown.total,
    rationale,
    score_breakdown: breakdown
  };
}

/**
 * Batch scoring function for multiple vendors
 */
export function calculateMatches(
  quiz: QuizData,
  vendors: VendorProjection[],
  weights?: ScoringWeights
): Array<VendorProjection & { match: MatchResult }> {
  return vendors
    .map(vendor => ({
      ...vendor,
      match: calculateMatch(quiz, vendor, weights)
    }))
    .filter(v => v.match.score > 0) // Remove zero-score matches
    .sort((a, b) => b.match.score - a.match.score); // Sort by score descending
}
