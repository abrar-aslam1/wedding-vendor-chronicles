/**
 * Cultural Matching Algorithm
 * Matches brides/couples with vendors based on cultural expertise,
 * language proficiency, ceremony experience, and preferences
 */

export interface BridePreferences {
  cultural_background: string[];
  religious_tradition: string[];
  ceremony_types: string[];
  preferred_languages: string[];
  requires_bilingual: boolean;
  wedding_style: string[];
  dietary_restrictions: string[];
  cultural_requirements: Record<string, any>;
  modesty_preferences?: string;
  budget_range?: string;
  wedding_date?: string;
  guest_count?: number;
  location?: string;
  importance_cultural_knowledge: number; // 1-5
  importance_language: number; // 1-5
  importance_style_match: number; // 1-5
  importance_price: number; // 1-5
  must_have_cultural_experience: boolean;
}

export interface VendorCulturalExpertise {
  cultural_types: string[];
  religious_traditions: string[];
  ceremony_experience: Record<string, number>; // {"mehndi": 25, "sangeet": 30}
  languages: string[];
  dietary_expertise: string[];
  modesty_services: boolean;
  gender_segregation_experience: boolean;
  traditional_dress_knowledge: string[];
  cultural_decor_expertise: string[];
  years_cultural_experience: number;
  total_cultural_events: number;
}

export interface VendorPricing {
  price_min?: number;
  price_max?: number;
  starting_price?: number;
}

export interface MatchScore {
  vendor_id: string;
  total_score: number; // 0-100
  breakdown: {
    cultural_expertise_score: number; // max 30
    language_match_score: number; // max 15
    ceremony_experience_score: number; // max 25
    style_alignment_score: number; // max 15
    price_match_score: number; // max 10
    availability_score: number; // max 5
  };
  match_reasons: string[];
  cultural_highlights: string[];
  is_top_match: boolean;
}

/**
 * Calculate cultural expertise match score (max 30 points)
 */
function calculateCulturalExpertiseScore(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Check if vendor specializes in bride's cultural background (20 points max)
  const culturalMatches = bridePrefs.cultural_background.filter(
    bg => vendorExpertise.cultural_types.includes(bg)
  );

  if (culturalMatches.length > 0) {
    score += 20;
    reasons.push(
      `Specializes in ${culturalMatches.join(', ')} weddings`
    );
  } else if (vendorExpertise.total_cultural_events > 50) {
    // Fallback: extensive general cultural experience
    score += 10;
    reasons.push(`Has extensive multicultural wedding experience`);
  }

  // Check religious tradition alignment (10 points max)
  const religionMatches = bridePrefs.religious_tradition.filter(
    rt => vendorExpertise.religious_traditions.includes(rt)
  );

  if (religionMatches.length > 0) {
    score += 10;
    reasons.push(
      `Experienced with ${religionMatches.join(', ')} traditions`
    );
  }

  return { score, reasons };
}

/**
 * Calculate language match score (max 15 points)
 */
function calculateLanguageScore(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const languageMatches = bridePrefs.preferred_languages.filter(
    lang => vendorExpertise.languages.includes(lang)
  );

  if (languageMatches.length === 0) {
    // No language match
    if (bridePrefs.requires_bilingual) {
      score = 0; // Critical miss
    } else {
      score = 5; // English assumed
    }
  } else {
    // Has language match
    const pointsPerLanguage = 5;
    score = Math.min(15, languageMatches.length * pointsPerLanguage);
    
    if (languageMatches.length === 1) {
      reasons.push(`Speaks ${languageMatches[0]}`);
    } else {
      reasons.push(`Multilingual: ${languageMatches.join(', ')}`);
    }
  }

  return { score, reasons };
}

/**
 * Calculate ceremony experience score (max 25 points)
 */
function calculateCeremonyExperienceScore(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Check experience with each ceremony type the bride is planning
  for (const ceremonyType of bridePrefs.ceremony_types) {
    const experience = vendorExpertise.ceremony_experience[ceremonyType] || 0;
    
    if (experience > 0) {
      // Award points based on experience level
      // 0-5 events: 3 points
      // 6-15 events: 4 points
      // 16-30 events: 5 points
      // 31+ events: 5 points
      let points = 0;
      if (experience >= 31) {
        points = 5;
        reasons.push(`${experience}+ ${formatCeremonyName(ceremonyType)} ceremonies (expert)`);
      } else if (experience >= 16) {
        points = 5;
        reasons.push(`${experience} ${formatCeremonyName(ceremonyType)} ceremonies`);
      } else if (experience >= 6) {
        points = 4;
        reasons.push(`${experience} ${formatCeremonyName(ceremonyType)} ceremonies`);
      } else {
        points = 3;
        reasons.push(`Has done ${formatCeremonyName(ceremonyType)} ceremonies`);
      }
      
      score += points;
    }
  }

  // Cap at 25 points
  score = Math.min(25, score);

  return { score, reasons };
}

/**
 * Calculate style alignment score (max 15 points)
 * TODO: Implement AI image analysis for style matching
 */
function calculateStyleScore(
  bridePrefs: BridePreferences,
  vendorStyles?: string[]
): { score: number; reasons: string[] } {
  let score = 10; // Default baseline
  const reasons: string[] = [];

  // For now, use basic style matching
  // In Phase 2, integrate AI image analysis
  if (vendorStyles && vendorStyles.length > 0) {
    const styleMatches = bridePrefs.wedding_style.filter(
      style => vendorStyles.includes(style)
    );
    
    if (styleMatches.length > 0) {
      score = 15;
      reasons.push(`Matches your ${styleMatches[0]} style`);
    }
  }

  return { score, reasons };
}

/**
 * Calculate price match score (max 10 points)
 */
function calculatePriceScore(
  bridePrefs: BridePreferences,
  vendorPricing?: VendorPricing
): { score: number; reasons: string[] } {
  let score = 5; // Default baseline
  const reasons: string[] = [];

  if (!bridePrefs.budget_range || !vendorPricing) {
    return { score, reasons };
  }

  const budgetRanges: Record<string, { min: number; max: number }> = {
    under_2k: { min: 0, max: 2000 },
    '2k_5k': { min: 2000, max: 5000 },
    '5k_10k': { min: 5000, max: 10000 },
    '10k_20k': { min: 10000, max: 20000 },
    '20k_plus': { min: 20000, max: 999999 }
  };

  const brideBudget = budgetRanges[bridePrefs.budget_range];
  if (!brideBudget) return { score, reasons };

  const vendorMin = (vendorPricing.price_min || vendorPricing.starting_price || 0) / 100;
  const vendorMax = (vendorPricing.price_max || vendorMin * 2) / 100;

  // Check if vendor pricing overlaps with budget
  const hasOverlap = !(vendorMin > brideBudget.max || vendorMax < brideBudget.min);

  if (hasOverlap) {
    // Full overlap = 10 points
    // Partial overlap = 7 points
    if (vendorMin >= brideBudget.min && vendorMax <= brideBudget.max) {
      score = 10;
      reasons.push('Within your budget range');
    } else {
      score = 7;
      reasons.push('Partially within budget');
    }
  } else {
    score = 3;
  }

  return { score, reasons };
}

/**
 * Calculate availability score (max 5 points)
 */
function calculateAvailabilityScore(
  bridePrefs: BridePreferences,
  isAvailable: boolean
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  
  if (!bridePrefs.wedding_date) {
    return { score: 3, reasons }; // No date specified
  }

  if (isAvailable) {
    reasons.push('Available on your wedding date');
    return { score: 5, reasons };
  } else {
    return { score: 0, reasons };
  }
}

/**
 * Generate cultural highlights for vendor card
 */
function generateCulturalHighlights(
  vendorExpertise: VendorCulturalExpertise,
  bridePrefs: BridePreferences
): string[] {
  const highlights: string[] = [];

  // Dietary expertise highlights
  const dietaryMatches = bridePrefs.dietary_restrictions.filter(
    diet => vendorExpertise.dietary_expertise.includes(diet)
  );
  
  if (dietaryMatches.length > 0) {
    highlights.push(
      `${dietaryMatches.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} expertise`
    );
  }

  // Modesty services
  if (bridePrefs.modesty_preferences && vendorExpertise.modesty_services) {
    highlights.push('Offers modest photography/services');
  }

  // Gender segregation experience
  if (vendorExpertise.gender_segregation_experience) {
    highlights.push('Experience with gender-segregated events');
  }

  // Traditional dress knowledge
  if (vendorExpertise.traditional_dress_knowledge.length > 0) {
    highlights.push(
      `Knows ${vendorExpertise.traditional_dress_knowledge.join(', ')} attire`
    );
  }

  // Years of cultural experience
  if (vendorExpertise.years_cultural_experience >= 5) {
    highlights.push(
      `${vendorExpertise.years_cultural_experience}+ years cultural wedding experience`
    );
  }

  return highlights;
}

/**
 * Format ceremony name for display
 */
function formatCeremonyName(ceremony: string): string {
  const names: Record<string, string> = {
    mehndi: 'Mehndi',
    sangeet: 'Sangeet',
    haldi: 'Haldi',
    baraat: 'Baraat',
    nikah: 'Nikah',
    walima: 'Walima',
    ketubah: 'Ketubah Signing',
    chuppah: 'Chuppah',
    tea_ceremony: 'Tea Ceremony',
    pyebaek: 'Pyebaek'
  };
  
  return names[ceremony] || ceremony.charAt(0).toUpperCase() + ceremony.slice(1);
}

/**
 * Main matching algorithm
 * Calculates comprehensive match score between bride preferences and vendor
 */
export function calculateCulturalMatch(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise,
  vendorPricing?: VendorPricing,
  vendorStyles?: string[],
  isAvailable: boolean = true
): MatchScore {
  // Calculate individual scores
  const culturalResult = calculateCulturalExpertiseScore(bridePrefs, vendorExpertise);
  const languageResult = calculateLanguageScore(bridePrefs, vendorExpertise);
  const ceremonyResult = calculateCeremonyExperienceScore(bridePrefs, vendorExpertise);
  const styleResult = calculateStyleScore(bridePrefs, vendorStyles);
  const priceResult = calculatePriceScore(bridePrefs, vendorPricing);
  const availabilityResult = calculateAvailabilityScore(bridePrefs, isAvailable);

  // Apply importance weights
  const weightedCultural = culturalResult.score * (bridePrefs.importance_cultural_knowledge / 5);
  const weightedLanguage = languageResult.score * (bridePrefs.importance_language / 5);
  const weightedCeremony = ceremonyResult.score; // Always important
  const weightedStyle = styleResult.score * (bridePrefs.importance_style_match / 5);
  const weightedPrice = priceResult.score * (bridePrefs.importance_price / 5);

  const total_score = Math.round(
    weightedCultural +
    weightedLanguage +
    weightedCeremony +
    weightedStyle +
    weightedPrice +
    availabilityResult.score
  );

  // Combine all reasons
  const match_reasons = [
    ...culturalResult.reasons,
    ...languageResult.reasons,
    ...ceremonyResult.reasons,
    ...styleResult.reasons,
    ...priceResult.reasons,
    ...availabilityResult.reasons
  ];

  // Generate cultural highlights
  const cultural_highlights = generateCulturalHighlights(vendorExpertise, bridePrefs);

  // Determine if this is a top match (>= 80% score)
  const is_top_match = total_score >= 80;

  return {
    vendor_id: '', // Will be set by caller
    total_score,
    breakdown: {
      cultural_expertise_score: Math.round(weightedCultural),
      language_match_score: Math.round(weightedLanguage),
      ceremony_experience_score: Math.round(weightedCeremony),
      style_alignment_score: Math.round(weightedStyle),
      price_match_score: Math.round(weightedPrice),
      availability_score: availabilityResult.score
    },
    match_reasons,
    cultural_highlights,
    is_top_match
  };
}

/**
 * Get match badge color based on score
 */
export function getMatchBadgeColor(score: number): string {
  if (score >= 90) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get match badge label based on score
 */
export function getMatchBadgeLabel(score: number): string {
  if (score >= 90) return 'Perfect Match';
  if (score >= 80) return 'Excellent Match';
  if (score >= 70) return 'Great Match';
  if (score >= 60) return 'Good Match';
  return 'Potential Match';
}

/**
 * Cultural type display names
 */
export const CULTURAL_TYPES: Record<string, string> = {
  south_asian_indian: 'Indian',
  south_asian_pakistani: 'Pakistani',
  south_asian_bangladeshi: 'Bangladeshi',
  south_asian_sri_lankan: 'Sri Lankan',
  muslim: 'Muslim Weddings',
  jewish_orthodox: 'Orthodox Jewish',
  jewish_reform: 'Reform Jewish',
  jewish_conservative: 'Conservative Jewish',
  chinese: 'Chinese',
  korean: 'Korean',
  japanese: 'Japanese',
  vietnamese: 'Vietnamese',
  latino: 'Latino/Hispanic',
  african: 'African',
  caribbean: 'Caribbean'
};

/**
 * Ceremony type display names
 */
export const CEREMONY_TYPES: Record<string, string> = {
  mehndi: 'Mehndi/Henna',
  sangeet: 'Sangeet',
  haldi: 'Haldi',
  baraat: 'Baraat',
  nikah: 'Nikah',
  walima: 'Walima',
  ketubah: 'Ketubah Signing',
  chuppah: 'Chuppah Ceremony',
  bedeken: 'Bedeken',
  hora: 'Hora',
  tea_ceremony: 'Tea Ceremony',
  pyebaek: 'Pyebaek',
  pao_de_lo: 'Pão de Ló'
};

/**
 * Language display names
 */
export const LANGUAGES: Record<string, string> = {
  hindi: 'Hindi',
  urdu: 'Urdu',
  punjabi: 'Punjabi',
  gujarati: 'Gujarati',
  bengali: 'Bengali',
  tamil: 'Tamil',
  telugu: 'Telugu',
  malayalam: 'Malayalam',
  arabic: 'Arabic',
  hebrew: 'Hebrew',
  mandarin: 'Mandarin',
  cantonese: 'Cantonese',
  korean: 'Korean',
  japanese: 'Japanese',
  vietnamese: 'Vietnamese',
  spanish: 'Spanish',
  french: 'French'
};
