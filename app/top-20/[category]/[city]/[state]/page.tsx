import React, { Suspense } from 'react';
import { MainNav } from "@/src/components/MainNav";
import { SearchContainerClient } from "@/app/_components/SearchContainerClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/src/components/ui/breadcrumb";
import { SEOHead } from "@/src/components/SEOHead";
import { SchemaMarkup } from "@/src/components/SchemaMarkup";

interface SearchPageProps {
  params: Promise<{
    category: string;
    city: string;
    state: string;
  }>;
  searchParams: Promise<{
    subcategory?: string;
  }>;
}

export default async function Top20SearchPage({ params, searchParams }: SearchPageProps) {
  // Resolve async params (Next.js 15 pattern)
  const { category, city, state } = await params;
  const { subcategory } = await searchParams;
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding-vendors';
  
  // Create canonical URL (no query parameters)
  const canonicalUrl = `https://findmyweddingvendor.com/top-20/${category}/${city}/${state}`;
  
  return (
    <div className="min-h-screen bg-background">
      <head>
        <link rel="canonical" href={canonicalUrl} />
      </head>
      <SEOHead 
        category={category?.replace('top-20/', '')} 
        city={city} 
        state={state}
        subcategory={subcategory}
      />
      <SchemaMarkup
        category={cleanCategory}
        city={city}
        state={state}
        subcategory={subcategory}
      />
      <MainNav />
      <div className="container mx-auto px-4 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
              <BreadcrumbItem>
                {subcategory ? (
                  <BreadcrumbLink href={`/top-20/${category}`}>
                    {cleanCategory.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>
                    {cleanCategory.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                    {city && state ? ` in ${city}, ${state}` : ''}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            )}
            
            {subcategory && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                  {city && state ? ` in ${city}, ${state}` : ''}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
        <SearchContainerClient 
          category={category}
          subcategory={subcategory}
          city={city}
          state={state}
        />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: SearchPageProps) {
  const { category, city, state } = await params;
  const { subcategory } = await searchParams;
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
  const titleCategory = cleanCategory.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const titleCity = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
  const titleState = state ? state.charAt(0).toUpperCase() + state.slice(1) : '';
  
  const location = city && state ? ` in ${titleCity}, ${titleState}` : '';
  const subcategoryText = subcategory ? ` - ${subcategory}` : '';
  
  const canonicalUrl = `https://findmyweddingvendor.com/top-20/${category}/${city}/${state}`;
  
  return {
    title: `Top 20 ${titleCategory}${subcategoryText}${location} | Wedding Vendor Chronicles`,
    description: `Find the top 20 ${cleanCategory}${subcategoryText}${location}. Browse reviews, compare pricing, and book trusted wedding vendors.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Top 20 ${titleCategory}${location}`,
      description: `Find the top 20 ${cleanCategory}${location}. Browse reviews, compare pricing, and book trusted wedding vendors.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}
