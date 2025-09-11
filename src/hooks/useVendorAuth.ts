import { useState, useEffect } from 'react';
import { VendorAuth } from '@/integrations/supabase/types';

interface VendorAuthData {
  id: string;
  email: string;
  vendor_id: string;
  email_verified: boolean;
}

export const useVendorAuth = () => {
  const [vendorAuth, setVendorAuth] = useState<VendorAuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing vendor auth on mount
    checkVendorAuth();
  }, []);

  const checkVendorAuth = () => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      const vendorData = localStorage.getItem('vendor_data');
      
      if (token && vendorData) {
        const parsed = JSON.parse(vendorData);
        setVendorAuth(parsed);
      }
    } catch (error) {
      console.error('Error checking vendor auth:', error);
      // Clear invalid data
      localStorage.removeItem('vendor_auth_token');
      localStorage.removeItem('vendor_data');
    } finally {
      setLoading(false);
    }
  };

  const loginVendor = (token: string, vendorData: VendorAuthData) => {
    localStorage.setItem('vendor_auth_token', token);
    localStorage.setItem('vendor_data', JSON.stringify(vendorData));
    setVendorAuth(vendorData);
  };

  const logoutVendor = () => {
    localStorage.removeItem('vendor_auth_token');
    localStorage.removeItem('vendor_data');
    setVendorAuth(null);
  };

  const isAuthenticated = !!vendorAuth;

  const getAuthToken = () => {
    return localStorage.getItem('vendor_auth_token');
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
