import { Suspense } from 'react';
import MatchResultsClient from './MatchResultsClient';

export default function MatchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-primary"></div>
    </div>}>
      <MatchResultsClient />
    </Suspense>
  );
}
