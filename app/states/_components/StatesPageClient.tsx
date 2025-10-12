'use client';

import { EnhancedStateGrid } from '@/components/search/EnhancedStateGrid';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';

export function StatesPageClient() {
  return (
    <>
      <MainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-wedding-text mb-2">Find Wedding Vendors by State</h1>
          <p className="text-gray-600 mb-8">Select a state to browse wedding vendors in your area</p>
          <EnhancedStateGrid />
        </div>
      </div>
      <Footer />
    </>
  );
}
