# Next.js SSG/ISR Migration Guide

## ✅ What's Been Completed

### 1. Next.js Setup
- ✅ Installed Next.js 14 with required dependencies
- ✅ Created `next.config.mjs` with optimized settings
- ✅ Set up `app/layout.tsx` with full SEO metadata
- ✅ Created test homepage at `app/page.tsx`
- ✅ Updated `tsconfig.json` for Next.js compatibility
- ✅ Added Next.js scripts to `package.json`:
  - `npm run dev:next` - Run Next.js dev server
  - `npm run build:next` - Build Next.js app
  - `npm run start` - Start Next.js production server

### 2. SEO Improvements (Already Done)
- ✅ Installed `react-helmet-async`
- ✅ Created SEO component
- ✅ Fixed `robots.txt` (reduced crawl-delay, removed restrictive rules)
- ✅ Your existing `SEOHead` and `SchemaMarkup` components are excellent

### 3. TypeScript Fixes Applied
- ✅ Fixed export type issues in `testDallasVendors.ts`
- ✅ Removed unused `@ts-expect-error` directives in `HashtagSchemaMarkup.tsx`
- ✅ Updated `PerformanceMonitor.tsx` to use web-vitals v4 API (onINP instead of onFID)
- ✅ Added `downlevelIteration` to tsconfig for Set/Map spread

## 🚧 Current Blockers

### Type Errors in Existing Code
The Next.js build is more strict than Vite. You're hitting Supabase type mismatches:
- `subscription_plans` table not in generated types
- Other type inconsistencies in existing components

### Solutions:
1. **Regenerate Supabase types:**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
   ```

2. **Or temporarily disable strict type checking for migration:**
   Update `next.config.mjs`:
   ```js
   const nextConfig = {
     typescript: {
       ignoreBuildErrors: true, // Remove after migration
     },
     eslint: {
       ignoreDuringBuilds: true, // Remove after migration
     },
     // ... rest of config
   };
   ```

## 📋 Next Steps: Migration Roadmap

### Phase 1: Get Next.js Building (1-2 days)
1. **Option A - Clean build first:**
   ```bash
   # Temporarily ignore type errors
   # Update next.config.mjs as shown above
   npm run build:next
   ```

2. **Option B - Fix types properly:**
   ```bash
   # Regenerate Supabase types
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts

   # Fix remaining type errors one by one
   npm run build:next
   ```

### Phase 2: Migrate Core Pages (3-5 days)

#### 1. Homepage - SSG
Create `app/page.tsx`:
```tsx
import { MainNav } from '@/components/MainNav';
import { HeroSection } from '@/components/home/HeroSection';
// ... other imports

export const metadata = {
  title: 'Find My Wedding Vendor | Top Wedding Services Directory',
  description: '...',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <main>
        <HeroSection />
        <SearchSection />
        <CategoriesGrid />
      </main>
      <Footer />
    </div>
  );
}
```

#### 2. State Pages - SSG with Static Params
Create `app/states/[state]/page.tsx`:
```tsx
import { supabase } from '@/integrations/supabase/client';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const states = [
    'alabama', 'alaska', 'arizona', // ... all 50 states
  ];
  return states.map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateName = params.state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `Wedding Vendors in ${stateName}`,
    description: `Find the best wedding vendors in ${stateName}...`,
  };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  // Server-side data fetching
  const { data } = await supabase
    .from('location_metadata')
    .select('*')
    .ilike('state', params.state);

  return (
    <div>
      {/* Your existing StateDetail component logic */}
    </div>
  );
}
```

#### 3. City Pages - ISR (On-Demand Generation)
Create `app/states/[state]/[city]/page.tsx`:
```tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Dynamic metadata
}

export default async function CityPage({ params }: Props) {
  // Fetch city data server-side
  const { data } = await supabase
    .from('location_metadata')
    .select('*')
    .ilike('city', params.city)
    .ilike('state', params.state)
    .single();

  return (
    <div>
      {/* Render city page */}
    </div>
  );
}
```

#### 4. Vendor Pages - ISR
Create `app/vendor/[vendorId]/page.tsx`:
```tsx
export const revalidate = 86400; // Revalidate daily

export default async function VendorPage({ params }: { params: { vendorId: string } }) {
  // Fetch vendor from cache or API
  const vendor = await fetchVendorData(params.vendorId);

  return (
    <div>
      {/* Your VendorDetail component */}
    </div>
  );
}
```

### Phase 3: Handle Client-Side Features (2-3 days)

#### Search Pages - Client Component
Create `app/search/[category]/page.tsx`:
```tsx
'use client'; // Mark as client component

import { SearchResults } from '@/components/search/SearchResults';
import { useSearchParams } from 'next/navigation';

export default function SearchPage({ params }: { params: { category: string } }) {
  const searchParams = useSearchParams();
  const location = searchParams.get('location');

  return (
    <div>
      {/* Client-side search logic */}
    </div>
  );
}
```

#### User Dashboards - Protected Client Routes
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  return <div>{/* Dashboard content */}</div>;
}
```

### Phase 4: Supabase Integration (1-2 days)

Create `lib/supabase/server.ts`:
```tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

Create `lib/supabase/client.ts`:
```tsx
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## 🎯 Recommended Migration Strategy

### Option 1: Gradual Migration (Recommended)
Keep both Vite and Next.js running:
- Vite app runs on current domain
- Next.js app runs on subdomain (e.g., `next.findmyweddingvendor.com`)
- Migrate pages gradually
- Test SEO improvements
- Switch DNS when ready

### Option 2: Big Bang Migration
- Complete full migration in dev
- Extensive testing
- Deploy everything at once
- Higher risk but cleaner

## 📊 Expected SEO Impact

### Current (SPA):
- JavaScript rendering required
- Slow initial indexing
- Meta tags loaded client-side
- Estimated: 20-30% of pages indexed

### After Next.js SSG/ISR:
- Immediate HTML with content
- Fast crawling
- Server-rendered meta tags
- Estimated: 80-90% of pages indexed within 2 weeks

## 🚀 Deployment

### Vercel (Recommended - Free Tier Available)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Netlify
```bash
# Build command: npm run build:next
# Publish directory: .next
```

### Self-Hosted
```bash
# Build
npm run build:next

# Start production server
npm run start
```

## 📝 Important Notes

1. **Keep Vite App Working**: Don't delete anything from `src/` until Next.js version is fully tested
2. **Environment Variables**: Copy `.env.local` settings for Next.js
3. **Public Assets**: Next.js serves from `/public` (same as Vite)
4. **Sitemap**: Generate new sitemap after migration pointing to Next.js URLs
5. **301 Redirects**: Set up redirects if URLs change

## 🆘 Troubleshooting

### "Module not found" errors
- Check import paths use `@/` alias
- Ensure `tsconfig.json` has correct paths

### Supabase auth issues
- Use separate server/client instances
- Server components: `lib/supabase/server.ts`
- Client components: `lib/supabase/client.ts`

### Build takes too long
- Implement ISR instead of full SSG for large page counts
- Use `generateStaticParams` selectively
- Consider incremental static regeneration

## 📧 Next Steps

1. **Immediate**: Fix type errors or add `ignoreBuildErrors: true` to next.config.mjs
2. **This Week**: Migrate homepage and state pages
3. **Next Week**: Migrate city and vendor pages with ISR
4. **Following Week**: Test, optimize, deploy to staging

---

**Status**: Next.js foundation is set up. Ready to start page migration once types are fixed.

**Time Estimate**: 1-2 weeks for full migration with testing
