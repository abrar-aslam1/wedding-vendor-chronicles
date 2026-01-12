import { Metadata } from 'next';
import { resolveParams } from '@/lib/migration-helpers';
import CityDetailClient from './CityDetailClient';

type Props = {
  params: Promise<{ state: string; city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await resolveParams(params);
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Wedding Vendors in ${cityName}, ${stateName} | Find My Wedding`,
    description: `Find the best wedding vendors in ${cityName}, ${stateName}. Browse photographers, venues, caterers, and more wedding professionals in ${cityName}.`,
    openGraph: {
      title: `Wedding Vendors in ${cityName}, ${stateName}`,
      description: `Find the best wedding vendors in ${cityName}, ${stateName}. Browse photographers, venues, caterers, and more wedding professionals in ${cityName}.`,
      type: 'website',
    },
  };
}

export default async function CityDetailPage({ params }: Props) {
  const { state, city } = await resolveParams(params);

  return <CityDetailClient state={state} city={city} />;
}
