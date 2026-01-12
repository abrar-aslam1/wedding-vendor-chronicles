'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import VendorDashboard from '@/pages/VendorDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { buildUrl } from '@/../lib/migration-helpers';

export default function VendorDashboardPage() {
  const { vendorAuth, loading, isAuthenticated } = useVendorAuth();
  const router = useRouter();
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to auth page with vendor tab
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/auth?tab=vendors&returnUrl=${returnUrl}`);
        return;
      }
      
      if (vendorAuth?.vendor_id) {
        setVendorId(vendorAuth.vendor_id);
      }
    }
  }, [vendorAuth, loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be signed in as a vendor to access this page.</p>
          <Button onClick={() => router.push('/auth?tab=vendors')}>
            Sign In as Vendor
          </Button>
        </div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h1>
          <p className="text-gray-600 mb-6">Your vendor account needs to be linked to a business profile.</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/list-business')}>
              Claim Your Business
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <VendorDashboard vendorId={vendorId} />;
}
