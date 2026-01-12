import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorAuth } from '@/integrations/supabase/types';

interface VendorAuthData {
  id: string;
  email: string;
  vendor_id: string | null;
  email_verified: boolean;
  isAdmin?: boolean;
}

// Admin emails that have full access
const ADMIN_EMAILS = ["abrar@amarosystems.com", "abraraslam139@gmail.com"];

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
        const userEmail = session.user.email || '';
        const isAdmin = ADMIN_EMAILS.includes(userEmail);

        // Allow access if user is a vendor OR is an admin
        if (userType === 'vendor' || isAdmin) {
          let vendorId: string | null = null;

          // Try to get vendor_id from vendors table where owner_id matches user
          const { data: vendorByOwnerId } = await supabase
            .from('vendors')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1)
            .single();

          if (vendorByOwnerId?.id) {
            vendorId = vendorByOwnerId.id;
          } else {
            // Fallback: Try to find vendor by email in contact_info
            const { data: allVendors } = await supabase
              .from('vendors')
              .select('id, contact_info')
              .limit(100);

            if (allVendors) {
              for (const vendor of allVendors) {
                const contactInfo = typeof vendor.contact_info === 'string' 
                  ? JSON.parse(vendor.contact_info) 
                  : vendor.contact_info;
                
                if (contactInfo?.email === userEmail) {
                  vendorId = vendor.id;
                  
                  // Update the owner_id to link this vendor to the user
                  await supabase
                    .from('vendors')
                    .update({ owner_id: session.user.id })
                    .eq('id', vendor.id);
                  
                  console.log('Linked vendor to user account by email match');
                  break;
                }
              }
            }

            // For admins without a specific vendor, get the first approved vendor
            if (!vendorId && isAdmin) {
              const { data: firstVendor } = await supabase
                .from('vendors')
                .select('id')
                .eq('verification_status', 'verified')
                .limit(1)
                .single();
              
              if (firstVendor?.id) {
                vendorId = firstVendor.id;
              }
            }
          }

          setVendorAuth({
            id: session.user.id,
            email: userEmail,
            vendor_id: vendorId,
            email_verified: session.user.email_confirmed_at !== null,
            isAdmin,
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
