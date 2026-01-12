import { Metadata } from 'next';
import { resolveParams } from '@/lib/migration-helpers';
import StateDetailClient from './StateDetailClient';

type Props = {
  params: Promise<{ state: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await resolveParams(params);
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Wedding Vendors in ${stateName} | Find My Wedding`,
    description: `Find the best wedding vendors in ${stateName}. Browse photographers, venues, caterers, and more in cities across ${stateName}.`,
    openGraph: {
      title: `Wedding Vendors in ${stateName}`,
      description: `Find the best wedding vendors in ${stateName}. Browse photographers, venues, caterers, and more in cities across ${stateName}.`,
      type: 'website',
    },
  };
}

export default async function StateDetailPage({ params }: Props) {
  const { state } = await resolveParams(params);

  return <StateDetailClient state={state} />;
}
