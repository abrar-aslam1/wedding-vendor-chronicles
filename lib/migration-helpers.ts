'use client';

/**
 * Migration Helpers for React Router to Next.js Navigation
 * 
 * This file provides utilities to help migrate from React Router to Next.js
 * while maintaining similar APIs during the transition period.
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Hook that provides a navigate function similar to React Router's useNavigate
 * Usage: const navigate = useNavigateCompat();
 *        navigate('/path');
 */
export function useNavigateCompat() {
  const router = useRouter();
  
  return (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}

/**
 * Hook that provides params object similar to React Router's useParams
 * Note: In Next.js, params come from the page props, not a hook
 * This is a compatibility shim for client components
 */
export function useParamsCompat<T extends Record<string, string>>(): Partial<T> {
  const pathname = usePathname();
  
  // Extract dynamic segments from pathname
  // This is a simplified version - actual params should come from page props
  const segments = pathname ? pathname.split('/').filter(Boolean) : [];
  const params: Partial<T> = {};
  
  // Note: This is a basic implementation
  // In actual migration, params should be passed down from server components
  console.warn('useParamsCompat is a temporary shim. Pass params via props instead.');
  
  return params;
}

/**
 * Hook that provides location object similar to React Router's useLocation
 */
export function useLocationCompat() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : '',
    searchParams,
    // Note: state and hash are not available in Next.js
    state: null,
    hash: '',
  };
}

/**
 * Convert React Router Link to Next.js Link-compatible props
 * Usage: <Link {...convertLinkProps({ to: '/path' })} />
 */
export function convertLinkProps(props: { to: string; replace?: boolean; state?: any }) {
  return {
    href: props.to,
    replace: props.replace,
    // Note: Next.js Link doesn't support state
  };
}

/**
 * Extract search params as an object
 */
export function useSearchParamsObject(): Record<string, string> {
  const searchParams = useSearchParams();
  const params: Record<string, string> = {};
  
  if (searchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  return params;
}

/**
 * Build URL with query parameters
 */
export function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  if (!params) return path;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Type-safe route builder for common routes
 */
export const routes = {
  home: () => '/',
  auth: (returnUrl?: string) => buildUrl('/auth', { returnUrl }),
  search: (params: {
    category: string;
    state: string;
    city: string;
    subcategory?: string;
  }) => {
    const { category, state, city, subcategory } = params;
    const base = `/search/${encodeURIComponent(category)}/${encodeURIComponent(
      state
    )}/${encodeURIComponent(city)}`;
    return subcategory ? `${base}?subcategory=${encodeURIComponent(subcategory)}` : base;
  },
  vendor: (vendorId: string) => `/vendor/${encodeURIComponent(vendorId)}`,
  state: (state: string) => `/states/${encodeURIComponent(state)}`,
  city: (state: string, city: string) =>
    `/states/${encodeURIComponent(state)}/${encodeURIComponent(city)}`,
  category: (category: string) => `/category/${encodeURIComponent(category)}`,
  portal: () => '/portal',
  favorites: () => '/favorites',
  listBusiness: () => '/list-business',
  admin: () => '/admin',
  vendorDashboard: () => '/vendor-dashboard',
} as const;

/**
 * Extract params from Next.js page props
 * This should be used in server components and passed down to client components
 */
export function extractPageParams<T extends Record<string, string>>(
  params: Promise<T> | T
): T | Promise<T> {
  // Next.js 15 may pass params as a promise
  return params;
}

/**
 * Utility to handle both sync and async params in Next.js 15
 */
export async function resolveParams<T extends Record<string, string>>(
  params: Promise<T> | T
): Promise<T> {
  return await params;
}
