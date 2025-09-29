import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BridePreferences {
  id: string;
  cultural_background: string[];
  religious_tradition: string[];
  ceremony_types: string[];
  preferred_languages: string[];
  requires_bilingual: boolean;
  wedding_style: string[];
  dietary_restrictions: string[];
  modesty_preferences: string | null;
  budget_range: string;
  location: string;
  importance_cultural_knowledge: number;
  importance_language: number;
  importance_style_match: number;
  importance_price: number;
  must_have_cultural_experience: boolean;
}

interface VendorCulturalExpertise {
  vendor_id: string;
  cultural_types: string[];
  religious_traditions: string[];
  ceremony_experience: Record<string, number>;
  languages: string[];
  dietary_expertise: string[];
  modesty_services: boolean;
  gender_segregation_experience: boolean;
  years_cultural_experience: number;
  total_cultural_events: number;
}

interface MatchScore {
  vendor_id: string;
  total_score: number;
  cultural_match_score: number;
  language_match_score: number;
  ceremony_match_score: number;
  style_match_score: number;
  weighted_score: number;
}

interface MatchExplanation {
  vendor_id: string;
  match_reasons: string[];
  strong_matches: string[];
  potential_concerns: string[];
}

// Calculate cultural background match
function calculateCulturalMatch(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): number {
  const brideCultures = new Set(bridePrefs.cultural_background);
  const vendorCultures = new Set(vendorExpertise.cultural_types);
  
  let matches = 0;
  let total = brideCultures.size;
  
  brideCultures.forEach(culture => {
    if (vendorCultures.has(culture)) {
      matches++;
    }
  });
  
  return total > 0 ? (matches / total) * 100 : 0;
}

// Calculate language match
function calculateLanguageMatch(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): number {
  const brideLanguages = new Set(bridePrefs.preferred_languages);
  const vendorLanguages = new Set(vendorExpertise.languages);
  
  let matches = 0;
  brideLanguages.forEach(lang => {
    if (vendorLanguages.has(lang)) {
      matches++;
    }
  });
  
  // If bilingual is required and no language match, return 0
  if (bridePrefs.requires_bilingual && matches === 0) {
    return 0;
  }
  
  return brideLanguages.size > 0 ? (matches / brideLanguages.size) * 100 : 100;
}

// Calculate ceremony experience match
function calculateCeremonyMatch(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): number {
  const brideCeremonies = bridePrefs.ceremony_types;
  const vendorCeremonies = vendorExpertise.ceremony_experience;
  
  if (brideCeremonies.length === 0) return 100;
  
  let totalScore = 0;
  brideCeremonies.forEach(ceremony => {
    const count = vendorCeremonies[ceremony] || 0;
    // Score based on experience: 0 events = 0, 1-2 = 50, 3-5 = 75, 6+ = 100
    if (count === 0) totalScore += 0;
    else if (count <= 2) totalScore += 50;
    else if (count <= 5) totalScore += 75;
    else totalScore += 100;
  });
  
  return totalScore / brideCeremonies.length;
}

// Calculate overall match score
function calculateMatch(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise
): MatchScore {
  const culturalScore = calculateCulturalMatch(bridePrefs, vendorExpertise);
  const languageScore = calculateLanguageMatch(bridePrefs, vendorExpertise);
  const ceremonyScore = calculateCeremonyMatch(bridePrefs, vendorExpertise);
  
  // For now, style match is 100 (will be enhanced in future)
  const styleScore = 100;
  
  // Calculate weighted score based on importance ratings
  const totalImportance = 
    bridePrefs.importance_cultural_knowledge +
    bridePrefs.importance_language +
    bridePrefs.importance_style_match;
  
  const weightedScore = (
    (culturalScore * bridePrefs.importance_cultural_knowledge) +
    (languageScore * bridePrefs.importance_language) +
    (styleScore * bridePrefs.importance_style_match)
  ) / totalImportance;
  
  // Average of all scores
  const totalScore = (culturalScore + languageScore + ceremonyScore + styleScore) / 4;
  
  return {
    vendor_id: vendorExpertise.vendor_id,
    total_score: Math.round(totalScore),
    cultural_match_score: Math.round(culturalScore),
    language_match_score: Math.round(languageScore),
    ceremony_match_score: Math.round(ceremonyScore),
    style_match_score: Math.round(styleScore),
    weighted_score: Math.round(weightedScore)
  };
}

// Generate match explanation
function generateExplanation(
  bridePrefs: BridePreferences,
  vendorExpertise: VendorCulturalExpertise,
  matchScore: MatchScore
): MatchExplanation {
  const matchReasons: string[] = [];
  const strongMatches: string[] = [];
  const concerns: string[] = [];
  
  // Cultural matches
  const culturalMatches = bridePrefs.cultural_background.filter(c => 
    vendorExpertise.cultural_types.includes(c)
  );
  if (culturalMatches.length > 0) {
    strongMatches.push(`Experienced with ${culturalMatches.join(', ')} weddings`);
  }
  
  // Language matches
  const languageMatches = bridePrefs.preferred_languages.filter(l =>
    vendorExpertise.languages.includes(l)
  );
  if (languageMatches.length > 0) {
    strongMatches.push(`Speaks ${languageMatches.join(', ')}`);
  }
  
  // Ceremony experience
  bridePrefs.ceremony_types.forEach(ceremony => {
    const count = vendorExpertise.ceremony_experience[ceremony] || 0;
    if (count > 5) {
      strongMatches.push(`Extensive ${ceremony} experience (${count}+ events)`);
    } else if (count > 0) {
      matchReasons.push(`Has done ${count} ${ceremony} ceremony/ceremonies`);
    } else {
      concerns.push(`No recorded ${ceremony} experience`);
    }
  });
  
  // Dietary expertise
  const dietaryMatches = bridePrefs.dietary_restrictions.filter(d =>
    vendorExpertise.dietary_expertise?.includes(d)
  );
  if (dietaryMatches.length > 0) {
    strongMatches.push(`Specializes in ${dietaryMatches.join(', ')}`);
  }
  
  // Modesty services
  if (bridePrefs.modesty_preferences && vendorExpertise.modesty_services) {
    strongMatches.push('Offers modesty-conscious services');
  }
  
  // Overall experience
  if (vendorExpertise.years_cultural_experience > 5) {
    matchReasons.push(`${vendorExpertise.years_cultural_experience}+ years of cultural wedding experience`);
  }
  
  if (vendorExpertise.total_cultural_events > 50) {
    matchReasons.push(`${vendorExpertise.total_cultural_events}+ cultural events completed`);
  }
  
  return {
    vendor_id: vendorExpertise.vendor_id,
    match_reasons: matchReasons,
    strong_matches: strongMatches,
    potential_concerns: concerns
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { preference_id } = await req.json();

    if (!preference_id) {
      throw new Error('preference_id is required');
    }

    // Fetch bride preferences
    const { data: bridePrefs, error: prefsError } = await supabaseClient
      .from('bride_preferences')
      .select('*')
      .eq('id', preference_id)
      .single();

    if (prefsError || !bridePrefs) {
      throw new Error('Bride preferences not found');
    }

    // Fetch all vendors with cultural expertise
    const { data: vendors, error: vendorsError } = await supabaseClient
      .from('vendor_cultural_expertise')
      .select('*');

    if (vendorsError) {
      throw new Error('Failed to fetch vendors');
    }

    console.log(`Found ${vendors?.length || 0} vendors with cultural profiles`);

    // Calculate matches for each vendor
    const matches: MatchScore[] = [];
    const explanations: MatchExplanation[] = [];

    vendors?.forEach(vendor => {
      const matchScore = calculateMatch(bridePrefs, vendor);
      const explanation = generateExplanation(bridePrefs, vendor, matchScore);
      
      // Only include vendors with minimum score threshold
      if (matchScore.weighted_score >= 30) {
        matches.push(matchScore);
        explanations.push(explanation);
      }
    });

    // Sort by weighted score
    matches.sort((a, b) => b.weighted_score - a.weighted_score);
    
    // Take top 20
    const topMatches = matches.slice(0, 20);
    const topExplanations = explanations.filter(e =>
      topMatches.some(m => m.vendor_id === e.vendor_id)
    );

    // Store match scores
    if (topMatches.length > 0) {
      const { error: scoresError } = await supabaseClient
        .from('wedding_match_scores')
        .upsert(
          topMatches.map(match => ({
            preference_id,
            vendor_id: match.vendor_id,
            total_score: match.total_score,
            cultural_match_score: match.cultural_match_score,
            language_match_score: match.language_match_score,
            ceremony_match_score: match.ceremony_match_score,
            style_match_score: match.style_match_score,
            weighted_score: match.weighted_score,
            calculated_at: new Date().toISOString()
          })),
          { onConflict: 'preference_id,vendor_id' }
        );

      if (scoresError) {
        console.error('Error storing match scores:', scoresError);
      }

      // Store explanations
      const { error: explanationsError } = await supabaseClient
        .from('wedding_match_explanations')
        .upsert(
          topExplanations.map(exp => ({
            preference_id,
            vendor_id: exp.vendor_id,
            match_reasons: exp.match_reasons,
            strong_matches: exp.strong_matches,
            potential_concerns: exp.potential_concerns
          })),
          { onConflict: 'preference_id,vendor_id' }
        );

      if (explanationsError) {
        console.error('Error storing explanations:', explanationsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches_found: topMatches.length,
        top_matches: topMatches.slice(0, 10),
        explanations: topExplanations.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
