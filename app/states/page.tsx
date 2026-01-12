import { Metadata } from 'next';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { EnhancedStateGrid } from '@/components/search/EnhancedStateGrid';

export const metadata: Metadata = {
  title: 'Browse Wedding Vendors by State | Find My Wedding',
  description: 'Find the perfect wedding vendors in your state. Browse our comprehensive directory of wedding professionals across the United States.',
  openGraph: {
    title: 'Browse Wedding Vendors by State',
    description: 'Find the perfect wedding vendors in your state. Browse our comprehensive directory of wedding professionals across the United States.',
    type: 'website',
  },
};

export default function StatesPage() {
  return (
    <>
      <MainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-wedding-text mb-2">
            Find Wedding Vendors by State
          </h1>
          <p className="text-gray-600 mb-8">
            Select a state to browse wedding vendors in your area
          </p>
          <EnhancedStateGrid />
        </div>
      </div>
      <Footer />
    </>
  );
}
