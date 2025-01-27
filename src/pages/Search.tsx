import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchForm } from "@/components/search/SearchForm";
import { MainNav } from "@/components/MainNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { prefetchCurrentRouteData } from "@/services/dataForSeoService";
import { locationCodes } from "@/utils/dataForSeoApi";

const Search = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (category && city && state) {
      const cleanCategory = category.replace('top-20/', '').replace(/-/g, ' ');
      const cleanCity = city.toLowerCase();
      const cleanState = state;
      
      fetchResults(cleanCategory, cleanCity, cleanState);
      prefetchCurrentRouteData(cleanCategory, cleanCity, cleanState).catch(console.error);
    }
  }, [category, city, state]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string) => {
    const categoryToUse = category ? category.replace('top-20/', '').replace(/-/g, ' ') : selectedCategory;
    navigate(`/top-20/${categoryToUse.toLowerCase().replace(/ /g, '-')}/${selectedCity}/${selectedState}`);
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string) => {
    setIsSearching(true);
    try {
      console.log('Fetching results for:', { searchCategory, searchCity, searchState });
      
      const query = supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', `${searchCategory} in ${searchCity}, ${searchState}`)
        .eq('city', searchCity)
        .eq('state', searchState);

      const { data: cachedResults, error } = await query.maybeSingle();
      
      console.log('Cache query result:', { cachedResults, error });

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

  // Get the clean category name for the preselected value
  const preselectedCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : undefined;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-8 mt-16">
        <SearchHeader />
        
        {/* Only show search form if we're not displaying specific city/state results */}
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