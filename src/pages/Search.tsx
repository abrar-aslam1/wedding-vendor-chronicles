import { MainNav } from "@/components/MainNav";
import { SearchContainer } from "@/components/search/SearchContainer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const Search = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  
  const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding-vendors';
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        category={category?.replace('top-20/', '')} 
        city={city} 
        state={state}
      />
      <SchemaMarkup
        category={cleanCategory}
        city={city}
        state={state}
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
                <BreadcrumbPage>
                  {cleanCategory.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {city && state ? ` in ${city}, ${state}` : ''}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <SearchContainer />
    </div>
  );
};

export default Search;
