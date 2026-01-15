import { Suspense } from 'react';
import VendorDashboardContent from './VendorDashboardContent';

export default function VendorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VendorDashboardContent />
    </Suspense>
  );
}
