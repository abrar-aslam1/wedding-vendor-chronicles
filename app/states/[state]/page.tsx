import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClientMainNav } from '../../_components/ClientMainNav';
import { ClientFooter } from '../../_components/ClientFooter';
import { createClient } from '../../_lib/supabase/server';
import { US_STATES, getDefaultCitiesForState } from '../../_lib/constants/states';
import { StateDetailClient } from './_components/StateDetailClient';

// Generate static params for all 50 states
export async function generateStaticParams() {
  return US_STATES.map((state) => ({
    state: state.slug,
  }));
}

// Generate metadata for each state
export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateObj = US_STATES.find(s => s.slug === params.state);
  const stateName = stateObj?.name || params.state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Wedding Vendors in ${stateName}`,
    description: `Find the best wedding vendors in ${stateName}. Browse photographers, venues, caterers, and more in cities across ${stateName}.`,
    openGraph: {
      title: `Wedding Vendors in ${stateName}`,
      description: `Find the best wedding vendors in ${stateName}. Browse photographers, venues, caterers, and more.`,
    },
  };
}

export default async function StateDetailPage({ params }: { params: { state: string } }) {
  const stateObj = US_STATES.find(s => s.slug === params.state);

  if (!stateObj) {
    notFound();
  }

  const stateName = stateObj.name;
  const supabase = createClient();

  // Fetch state data from Supabase
  const { data: stateData } = await supabase
    .from('location_metadata')
    .select('*')
    .ilike('state', stateName)
    .is('city', null)
    .maybeSingle();

  const vendorCount = stateData?.vendor_count || 0;
  const popularCities = stateData?.popular_cities
    ? Array.isArray(stateData.popular_cities)
      ? stateData.popular_cities.map(city => String(city))
      : []
    : getDefaultCitiesForState(stateName);

  return (
    <>
      <ClientMainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <StateDetailClient
          stateName={stateName}
          stateSlug={params.state}
          vendorCount={vendorCount}
          popularCities={popularCities}
        />
      </div>
      <ClientFooter />
    </>
  );
}
