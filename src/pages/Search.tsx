import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchForm } from "@/components/search/SearchForm";
import { MainNav } from "@/components/MainNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { prefetchCurrentRouteData, searchVendors } from "@/services/dataForSeoService";
import { Loader2 } from "lucide-react";

const Search = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (category && city && state) {
      console.log('Initial search params:', { category, city, state });
      const cleanCategory = category.replace('top-20/', '').replace(/-/g, ' ');
      fetchResults(cleanCategory, city, state);
      prefetchCurrentRouteData(cleanCategory, city, state).catch(console.error);
    }
  }, [category, city, state]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string) => {
    console.log('Handling search with:', { selectedCategory, selectedState, selectedCity });
    
    const categoryToUse = category 
      ? category.replace('top-20/', '').replace(/-/g, ' ') 
      : selectedCategory;
    
    const formattedCategory = categoryToUse.toLowerCase().replace(/ /g, '-');
    
    navigate(`/top-20/${formattedCategory}/${selectedCity}/${selectedState}`);
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string) => {
    setIsSearching(true);
    try {
      console.log('Fetching results for:', { searchCategory, searchCity, searchState });
      
      // First try to get results from the public cache
      const { data: cachedResults, error } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', `${searchCategory} in ${searchCity}, ${searchState}`)
        .eq('city', searchCity)
        .eq('state', searchState)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch results. Please try again.",
          variant: "destructive",
        });
        setSearchResults([]);
        return;
      }

      if (cachedResults?.search_results) {
        const results = Array.isArray(cachedResults.search_results) 
          ? cachedResults.search_results 
          : [];
        console.log('Setting search results:', results);
        setSearchResults(results);
      } else {
        console.log('No results found in cache');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const preselectedCategory = category 
    ? category.replace('top-20/', '').replace(/-/g, ' ') 
    : undefined;

  if (isSearching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <MainNav />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-wedding-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold text-wedding-text mt-4">
            Finding the Perfect Vendors
          </h1>
          <p className="text-gray-600 mt-2">
            We're searching for the best matches in your area...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-8 mt-16">
        <SearchHeader />
        
        {(!city || !state) && (
          <div className="max-w-2xl mx-auto mb-8">
            <SearchForm 
              onSearch={handleSearch} 
              isSearching={isSearching} 
              preselectedCategory={preselectedCategory} 
            />
          </div>
        )}
        
        <SearchResults results={searchResults} isSearching={isSearching} />
      </div>
    </div>
  );
};

export default Search;