import { Suspense } from 'react';
import { MainNav } from "@/components/MainNav";
import { SearchContainerClient } from "@/_components/SearchContainerClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import { SchemaMarkup } from "@/components/SchemaMarkup";

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
  
  return (
    <div className="min-h-screen bg-background">
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
  
  const location = city && state ? ` in ${city}, ${state}` : '';
  const subcategoryText = subcategory ? ` - ${subcategory}` : '';
  
  return {
    title: `Top 20 ${titleCategory}${subcategoryText}${location} | Wedding Vendor Chronicles`,
    description: `Find the top 20 ${cleanCategory}${subcategoryText}${location}. Browse reviews, compare pricing, and book trusted wedding vendors.`,
  };
}
