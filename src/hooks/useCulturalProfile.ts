import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CulturalProfile {
  id?: string;
  vendor_id: string;
  cultural_types: string[];
  religious_traditions: string[];
  ceremony_experience: Record<string, number>;
  languages: string[];
  dietary_expertise: string[];
  modesty_services: boolean;
  gender_segregation_experience: boolean;
  traditional_dress_knowledge: string[];
  cultural_decor_expertise: string[];
  certifications?: string;
  years_cultural_experience: number;
  total_cultural_events: number;
  cultural_portfolio_images: Array<{
    url: string;
    ceremony_type: string;
    cultural_type: string;
  }>;
}

export const useCulturalProfile = (vendorId: string) => {
  const [profile, setProfile] = useState<CulturalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [vendorId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_cultural_expertise' as any)
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfile(data as unknown as CulturalProfile);
      } else {
        // Initialize empty profile
        setProfile({
          vendor_id: vendorId,
          cultural_types: [],
          religious_traditions: [],
          ceremony_experience: {},
          languages: [],
          dietary_expertise: [],
          modesty_services: false,
          gender_segregation_experience: false,
          traditional_dress_knowledge: [],
          cultural_decor_expertise: [],
          years_cultural_experience: 0,
          total_cultural_events: 0,
          cultural_portfolio_images: []
        });
      }
    } catch (error) {
      console.error('Error fetching cultural profile:', error);
      toast.error('Failed to load cultural profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: Partial<CulturalProfile>) => {
    try {
      setSaving(true);
      
      const profileData = {
        vendor_id: vendorId,
        ...updatedProfile,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vendor_cultural_expertise' as any)
        .upsert(profileData, {
          onConflict: 'vendor_id'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data as unknown as CulturalProfile);
      toast.success('Cultural profile updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error saving cultural profile:', error);
      toast.error('Failed to save cultural profile');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
    refreshProfile: fetchProfile
  };
};
