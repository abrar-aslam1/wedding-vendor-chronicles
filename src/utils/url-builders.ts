/**
 * Centralized URL builders for top-20 listing pages.
 * All listing URLs must go through these helpers to ensure
 * a single canonical URL format is generated everywhere.
 *
 * Canonical format:
 *   /top-20/{category}/{city}/{state}
 *   /top-20/{category}/{subcategory}/{city}/{state}
 *
 * NO query-parameter variants are allowed.
 */

const BASE_URL = 'https://findmyweddingvendor.com';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build a relative top-20 listing path (no origin). */
export function buildListingPath(params: {
  category: string;
  city: string;
  state: string;
  subcategory?: string;
}): string {
  const cat = slugify(params.category);
  const city = slugify(params.city);
  const state = slugify(params.state);

  if (params.subcategory) {
    const sub = slugify(params.subcategory);
    return `/top-20/${cat}/${sub}/${city}/${state}`;
  }
  return `/top-20/${cat}/${city}/${state}`;
}

/** Build a full canonical URL for a top-20 listing page. */
export function buildListingCanonical(params: {
  category: string;
  city: string;
  state: string;
  subcategory?: string;
}): string {
  return `${BASE_URL}${buildListingPath(params)}`;
}

/**
 * Assert that a URL is in the canonical listing format.
 * Throws if it contains query-param subcategory or uses /search/ prefix.
 * Useful in tests or dev-mode guards.
 */
export function assertCanonicalListingUrl(url: string): void {
  if (url.includes('?subcategory=')) {
    throw new Error(
      `URL contains query-param subcategory (must use path segment): ${url}`
    );
  }
  if (url.includes('/search/') && url.includes('/top-20/')) {
    throw new Error(`URL mixes /search/ and /top-20/ prefixes: ${url}`);
  }
}
