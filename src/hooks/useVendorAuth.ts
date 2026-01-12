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

      console.log('[useVendorAuth] Session check:', { hasSession: !!session, error: sessionError });

      if (sessionError) throw sessionError;

      if (session?.user) {
        const userType = session.user.user_metadata?.user_type;
        const userEmail = session.user.email || '';
        const isAdmin = ADMIN_EMAILS.includes(userEmail);

        console.log('[useVendorAuth] User info:', { 
          userId: session.user.id, 
          userEmail, 
          userType, 
          isAdmin,
          metadata: session.user.user_metadata 
        });

        // Allow access if user is a vendor OR is an admin
        if (userType === 'vendor' || isAdmin) {
          let vendorId: string | null = null;

          // Try to get vendor_id from vendors table where owner_id matches user
          const { data: vendorByOwnerId, error: ownerError } = await supabase
            .from('vendors')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1)
            .single();

          console.log('[useVendorAuth] Vendor by owner_id lookup:', { 
            vendorByOwnerId, 
            error: ownerError 
          });

          if (vendorByOwnerId?.id) {
            vendorId = vendorByOwnerId.id;
            console.log('[useVendorAuth] Found vendor by owner_id:', vendorId);
          } else {
            // Fallback: Try to find vendor by email in contact_info
            const { data: allVendors, error: allError } = await supabase
              .from('vendors')
              .select('id, contact_info, business_name')
              .limit(100);

            console.log('[useVendorAuth] All vendors fetch:', { 
              count: allVendors?.length || 0, 
              error: allError 
            });

            if (allVendors) {
              for (const vendor of allVendors) {
                const contactInfo = typeof vendor.contact_info === 'string' 
                  ? JSON.parse(vendor.contact_info) 
                  : vendor.contact_info;
                
                console.log('[useVendorAuth] Checking vendor:', { 
                  id: vendor.id, 
                  businessName: vendor.business_name,
                  contactEmail: contactInfo?.email 
                });
                
                if (contactInfo?.email === userEmail) {
                  vendorId = vendor.id;
                  
                  // Update the owner_id to link this vendor to the user
                  const { error: updateError } = await supabase
                    .from('vendors')
                    .update({ owner_id: session.user.id })
                    .eq('id', vendor.id);
                  
                  console.log('[useVendorAuth] Linked vendor by email match:', { vendorId, updateError });
                  break;
                }
              }
            }

            // For admins without a specific vendor, get the first approved vendor
            if (!vendorId && isAdmin) {
              console.log('[useVendorAuth] Admin user, looking for any verified vendor...');
              
              const { data: firstVendor, error: firstError } = await supabase
                .from('vendors')
                .select('id, business_name')
                .eq('verification_status', 'verified')
                .limit(1)
                .single();
              
              console.log('[useVendorAuth] First verified vendor lookup:', { firstVendor, error: firstError });
              
              if (firstVendor?.id) {
                vendorId = firstVendor.id;
              } else {
                // Try without verification filter - maybe none are verified yet
                const { data: anyVendor, error: anyError } = await supabase
                  .from('vendors')
                  .select('id, business_name, verification_status')
                  .limit(1)
                  .single();
                
                console.log('[useVendorAuth] Any vendor lookup:', { anyVendor, error: anyError });
                
                if (anyVendor?.id) {
                  vendorId = anyVendor.id;
                  console.log('[useVendorAuth] Using any vendor for admin:', vendorId);
                }
              }
            }
          }

          const authData = {
            id: session.user.id,
            email: userEmail,
            vendor_id: vendorId,
            email_verified: session.user.email_confirmed_at !== null,
            isAdmin,
          };

          console.log('[useVendorAuth] Final auth data:', authData);
          setVendorAuth(authData);
        } else {
          console.log('[useVendorAuth] User is not a vendor and not an admin, setting null');
          setVendorAuth(null);
        }
      } else {
        console.log('[useVendorAuth] No session, setting null');
        setVendorAuth(null);
      }
    } catch (error) {
      console.error('[useVendorAuth] Error checking vendor auth:', error);
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
