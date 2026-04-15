import { permanentRedirect } from 'next/navigation';

interface SearchPageProps {
  params: Promise<{
    category: string;
    state: string;
    city: string;
  }>;
  searchParams: Promise<{
    subcategory?: string;
  }>;
}

// Legacy /search/ route — 301 redirect to canonical /top-20/ URL
export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { category, state, city } = await params;
  const { subcategory } = await searchParams;

  const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const stateSlug = state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  if (subcategory) {
    const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    permanentRedirect(`/top-20/${category}/${subcategorySlug}/${citySlug}/${stateSlug}`);
  }

  permanentRedirect(`/top-20/${category}/${citySlug}/${stateSlug}`);
}
