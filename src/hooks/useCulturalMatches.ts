import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MatchScore {
  vendor_id: string;
  total_score: number;
  cultural_match_score: number;
  language_match_score: number;
  ceremony_match_score: number;
  style_match_score: number;
  weighted_score: number;
  calculated_at: string;
}

export interface MatchExplanation {
  vendor_id: string;
  match_reasons: string[];
  strong_matches: string[];
  potential_concerns: string[];
}

export interface MatchedVendor {
  vendor: any; // Full vendor data
  match_score: MatchScore;
  explanation: MatchExplanation;
}

export const useCulturalMatches = (preferenceId: string | null) => {
  const [matches, setMatches] = useState<MatchedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preferenceId) {
      setLoading(false);
      return;
    }

    fetchMatches();
  }, [preferenceId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch match scores
      const { data: scores, error: scoresError } = await supabase
        .from('wedding_match_scores' as any)
        .select('*')
        .eq('preference_id', preferenceId)
        .order('weighted_score', { ascending: false });

      if (scoresError) throw scoresError;

      if (!scores || scores.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Fetch match explanations
      const { data: explanations, error: explanationsError } = await supabase
        .from('wedding_match_explanations' as any)
        .select('*')
        .eq('preference_id', preferenceId);

      if (explanationsError) throw explanationsError;

      // Fetch vendor details for matched vendors
      const vendorIds = scores.map((s: any) => s.vendor_id);
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .in('id', vendorIds);

      if (vendorsError) throw vendorsError;

      // Combine all data
      const matchedVendors: MatchedVendor[] = scores.map((score: any) => {
        const vendor = vendors?.find(v => v.id === score.vendor_id);
        const explanation = explanations?.find((e: any) => e.vendor_id === score.vendor_id) as any;

        return {
          vendor,
          match_score: score as MatchScore,
          explanation: (explanation || {
            vendor_id: score.vendor_id,
            match_reasons: [],
            strong_matches: [],
            potential_concerns: []
          }) as MatchExplanation
        };
      });

      setMatches(matchedVendors);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load your matches');
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches
  };
};
