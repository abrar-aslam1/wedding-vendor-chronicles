import { redirect } from 'next/navigation';

interface RedirectPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    city: string;
    state: string;
  }>;
}

/**
 * Redirect Route for Legacy/Malformed URLs
 * 
 * This route handles old URL patterns like:
 * /top-20/[category]/[subcategory]/[city]/[state]
 * 
 * And redirects them to the correct format:
 * /top-20/[category]/[city]/[state]?subcategory=[subcategory]
 */
export default async function RedirectPage({ params }: RedirectPageProps) {
  const { category, subcategory, city, state } = await params;
  
  // Normalize the parameters
  const normalizedCategory = normalizeUrlParam(category);
  const normalizedSubcategory = normalizeUrlParam(subcategory);
  const normalizedCity = normalizeUrlParam(city);
  const normalizedState = normalizeUrlParam(state);
  
  // Build the correct URL with subcategory as query parameter
  const correctUrl = `/top-20/${normalizedCategory}/${normalizedCity}/${normalizedState}?subcategory=${normalizedSubcategory}`;
  
  // Perform a permanent redirect (301) to preserve SEO value
  redirect(correctUrl);
}

/**
 * Normalize URL parameters by:
 * - Converting to lowercase
 * - Replacing special characters
 * - Handling spaces and line breaks
 * - Removing trailing/leading whitespace
 */
function normalizeUrlParam(param: string): string {
  if (!param) return '';
  
  return param
    .toLowerCase()
    .trim()
    // Remove line breaks and extra spaces
    .replace(/[\n\r]+/g, '')
    .replace(/\s+/g, '-')
    // Replace special characters commonly seen in URLs
    .replace(/&/g, 'and')
    .replace(/['"]/g, '')
    // Replace multiple dashes with single dash
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

// Generate metadata for the redirect page (though user won't see it)
export async function generateMetadata({ params }: RedirectPageProps) {
  const { category, city, state } = await params;
  
  return {
    title: 'Redirecting...',
    description: `Redirecting to ${category} in ${city}, ${state}`,
    robots: 'noindex, nofollow',
  };
}
