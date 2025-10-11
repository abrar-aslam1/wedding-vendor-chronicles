import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorAuth } from '@/integrations/supabase/types';

interface VendorAuthData {
  id: string;
  email: string;
  vendor_id: string | null;
  email_verified: boolean;
}

export const useVendorAuth = () => {
  const [vendorAuth, setVendorAuth] = useState<VendorAuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing vendor auth on mount
    checkVendorAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkVendorAuth();
      } else if (event === 'SIGNED_OUT') {
        setVendorAuth(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkVendorAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session?.user) {
        const userType = session.user.user_metadata?.user_type;

        // Only set vendor auth if user is a vendor
        if (userType === 'vendor') {
          // Try to get vendor_id from vendors table where owner_id matches user
          const { data: vendorData } = await supabase
            .from('vendors')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1)
            .single();

          setVendorAuth({
            id: session.user.id,
            email: session.user.email || '',
            vendor_id: vendorData?.id || null,
            email_verified: session.user.email_confirmed_at !== null,
          });
        } else {
          setVendorAuth(null);
        }
      } else {
        setVendorAuth(null);
      }
    } catch (error) {
      console.error('Error checking vendor auth:', error);
      setVendorAuth(null);
    } finally {
      setLoading(false);
    }
  };

  const loginVendor = async (token: string, vendorData: VendorAuthData) => {
    // This method is kept for backward compatibility but not used with Supabase OAuth
    setVendorAuth(vendorData);
  };

  const logoutVendor = async () => {
    await supabase.auth.signOut();
    setVendorAuth(null);
  };

  const isAuthenticated = !!vendorAuth;

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  return {
    vendorAuth,
    loading,
    isAuthenticated,
    loginVendor,
    logoutVendor,
    getAuthToken,
    checkVendorAuth
  };
};
