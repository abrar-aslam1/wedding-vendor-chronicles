import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { MainNav } from "@/src/components/MainNav";
import { SearchContainerClient } from "@/app/_components/SearchContainerClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/src/components/ui/breadcrumb";
import { SEOHead } from "@/src/components/SEOHead";
import { SchemaMarkup } from "@/src/components/SchemaMarkup";

interface SearchPageProps {
  params: Promise<{
    category: string;
    slug: string[];
  }>;
  searchParams: Promise<{
    subcategory?: string;
  }>;
}

export default async function Top20SearchPage({ params, searchParams }: SearchPageProps) {
  const { category, slug } = await params;
  const { subcategory: querySubcategory } = await searchParams;
  
  // Determine if we have 3 or 4 segments
  // 3 segments: [city, state] - main category page
  // 4 segments: [subcategory, city, state] - subcategory page
  const hasSubcategory = slug.length === 3;
  
  let subcategory: string | undefined;
  let city: string;
  let state: string;
  
  if (hasSubcategory) {
    // Format: /top-20/[category]/[subcategory]/[city]/[state]
    subcategory = slug[0];
    city = slug[1];
    state = slug[2];
  } else {
    // Format: /top-20/[category]/[city]/[state]
    city = slug[0];
    state = slug[1];
    subcategory = querySubcategory; // fallback to query param if provided
  }
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding-vendors';
  const cleanSubcategory = subcategory ? subcategory.replace(/-/g, ' ') : '';
  
  // Create canonical URL (no query parameters)
  const canonicalUrl = subcategory 
    ? `https://findmyweddingvendor.com/top-20/${category}/${subcategory}/${city}/${state}`
    : `https://findmyweddingvendor.com/top-20/${category}/${city}/${state}`;
  
  return (
    <div className="min-h-screen bg-background">
      <head>
        <link rel="canonical" href={canonicalUrl} />
      </head>
      <SEOHead 
        category={category?.replace('top-20/', '')} 
        city={city} 
        state={state}
        subcategory={cleanSubcategory}
      />
      <SchemaMarkup
        category={cleanCategory}
        city={city}
        state={state}
        subcategory={cleanSubcategory}
      />
      <MainNav />
      <div className="container mx-auto px-4 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/top-20/${category}/${city}/${state}`}>
                {cleanCategory.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {cleanSubcategory && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {cleanSubcategory.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {city && state ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.charAt(0).toUpperCase() + state.slice(1)}` : ''}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
            {!cleanSubcategory && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {city && state ? `${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.charAt(0).toUpperCase() + state.slice(1)}` : ''}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
        <SearchContainerClient 
          category={category}
          subcategory={cleanSubcategory}
          city={city}
          state={state}
        />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const { subcategory: querySubcategory } = await searchParams;
  
  const hasSubcategory = slug.length === 3;
  
  let subcategory: string | undefined;
  let city: string;
  let state: string;
  
  if (hasSubcategory) {
    subcategory = slug[0];
    city = slug[1];
    state = slug[2];
  } else {
    city = slug[0];
    state = slug[1];
    subcategory = querySubcategory;
  }
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
  const cleanSubcategory = subcategory ? subcategory.replace(/-/g, ' ') : '';
  
  const titleCategory = cleanCategory.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const titleSubcategory = cleanSubcategory ? cleanSubcategory.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : '';
  
  const titleCity = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
  const titleState = state ? state.charAt(0).toUpperCase() + state.slice(1) : '';
  
  const location = city && state ? ` in ${titleCity}, ${titleState}` : '';
  
  const canonicalUrl = subcategory 
    ? `https://findmyweddingvendor.com/top-20/${category}/${subcategory}/${city}/${state}`
    : `https://findmyweddingvendor.com/top-20/${category}/${city}/${state}`;
  
  const title = titleSubcategory 
    ? `Top 20 ${titleSubcategory} ${titleCategory}${location} | Wedding Vendor Chronicles`
    : `Top 20 ${titleCategory}${location} | Wedding Vendor Chronicles`;
    
  const description = cleanSubcategory
    ? `Find the top 20 ${cleanSubcategory} ${cleanCategory}${location}. Browse reviews, compare pricing, and book trusted wedding vendors specializing in ${cleanSubcategory}.`
    : `Find the top 20 ${cleanCategory}${location}. Browse reviews, compare pricing, and book trusted wedding vendors.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: titleSubcategory ? `Top 20 ${titleSubcategory} ${titleCategory}${location}` : `Top 20 ${titleCategory}${location}`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
  };
}
