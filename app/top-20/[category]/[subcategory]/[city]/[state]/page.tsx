import { Suspense } from 'react';
import { MainNav } from "@/components/MainNav";
import { SearchContainerClient } from "@/_components/SearchContainerClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import { SchemaMarkup } from "@/components/SchemaMarkup";

interface SearchPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    city: string;
    state: string;
  }>;
}

export default async function Top20SubcategorySearchPage({ params }: SearchPageProps) {
  // Resolve async params (Next.js 15 pattern)
  const { category, subcategory, city, state } = await params;
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding-vendors';
  const cleanSubcategory = subcategory ? subcategory.replace(/-/g, ' ') : undefined;
  
  return (
    <div className="min-h-screen bg-background">
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
            {category && (
              <BreadcrumbItem>
                <BreadcrumbLink href={`/top-20/${category}`}>
                  {cleanCategory.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            {subcategory && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {cleanSubcategory ? cleanSubcategory.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') : subcategory}
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
          subcategory={cleanSubcategory}
          city={city}
          state={state}
        />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SearchPageProps) {
  const { category, subcategory, city, state } = await params;
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
  const cleanSubcategory = subcategory ? subcategory.replace(/-/g, ' ') : '';
  
  const titleCategory = cleanCategory.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const titleSubcategory = cleanSubcategory.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const location = city && state ? ` in ${city}, ${state}` : '';
  const subcategoryText = cleanSubcategory ? ` - ${titleSubcategory}` : '';
  
  return {
    title: `Top 20 ${titleCategory}${subcategoryText}${location} | Wedding Vendor Chronicles`,
    description: `Find the top 20 ${cleanCategory}${subcategoryText.toLowerCase()}${location}. Browse reviews, compare pricing, and book trusted wedding vendors.`,
  };
}
