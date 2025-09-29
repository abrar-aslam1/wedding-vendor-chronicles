import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BridePreferences {
  id?: string;
  user_id?: string;
  cultural_background: string[];
  religious_tradition: string[];
  ceremony_types: string[];
  preferred_languages: string[];
  requires_bilingual: boolean;
  wedding_style: string[];
  color_preferences?: string[];
  dietary_restrictions: string[];
  cultural_requirements?: Record<string, any>;
  modesty_preferences?: string;
  budget_range: string;
  wedding_date?: Date | null;
  guest_count?: number;
  location?: string;
  importance_cultural_knowledge: number;
  importance_language: number;
  importance_style_match: number;
  importance_price: number;
  must_have_cultural_experience: boolean;
  quiz_completed: boolean;
  completed_at?: Date;
}

export const useBridePreferences = () => {
  const [saving, setSaving] = useState(false);
  const [savedPreferenceId, setSavedPreferenceId] = useState<string | null>(null);

  const savePreferences = async (preferences: Partial<BridePreferences>) => {
    try {
      setSaving(true);

      // Get current user (may be null if not logged in)
      const { data: { user } } = await supabase.auth.getUser();

      const preferencesData = {
        user_id: user?.id || null,
        cultural_background: preferences.cultural_background || [],
        religious_tradition: preferences.religious_tradition || [],
        ceremony_types: preferences.ceremony_types || [],
        preferred_languages: preferences.preferred_languages || [],
        requires_bilingual: preferences.requires_bilingual || false,
        wedding_style: preferences.wedding_style || [],
        dietary_restrictions: preferences.dietary_restrictions || [],
        modesty_preferences: preferences.modesty_preferences || null,
        budget_range: preferences.budget_range || '',
        wedding_date: preferences.wedding_date || null,
        guest_count: preferences.guest_count || null,
        location: preferences.location || '',
        importance_cultural_knowledge: preferences.importance_cultural_knowledge || 5,
        importance_language: preferences.importance_language || 4,
        importance_style_match: preferences.importance_style_match || 4,
        importance_price: preferences.importance_price || 5,
        must_have_cultural_experience: preferences.importance_cultural_knowledge! >= 4,
        quiz_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('bride_preferences' as any)
        .insert(preferencesData)
        .select()
        .single();

      if (error) throw error;

      const savedData = data as unknown as { id: string };
      setSavedPreferenceId(savedData.id);
      toast.success('Your preferences have been saved!');
      
      return { success: true, data: savedData, preferenceId: savedData.id };
    } catch (error) {
      console.error('Error saving bride preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (id: string, preferences: Partial<BridePreferences>) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('bride_preferences' as any)
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Preferences updated!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    savedPreferenceId,
    savePreferences,
    updatePreferences
  };
};
