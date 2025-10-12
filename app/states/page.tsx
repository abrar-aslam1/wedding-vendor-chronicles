import { Metadata } from 'next';
import { StatesPageClient } from './_components/StatesPageClient';

// Force dynamic rendering during migration
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Wedding Vendors by State',
  description: 'Find the perfect wedding vendors in your state. Browse our comprehensive directory of wedding professionals across the United States.',
};

export default function StatesPage() {
  return <StatesPageClient />;
}
