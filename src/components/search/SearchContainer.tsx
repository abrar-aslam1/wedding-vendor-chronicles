import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { prefetchCurrentRouteData } from "@/services/dataForSeoService";
import { SearchResult } from "@/types/search";
import { SearchHeader } from "./SearchHeader";
import { LoadingState } from "./LoadingState";

export const SearchContainer = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (category && city && state) {
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

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <SearchHeader />
      
      {(!city || !state) && (
        <div className="max-w-2xl mx-auto mb-8">
          <SearchForm 
            onSearch={handleSearch} 
            isSearching={isSearching} 
            preselectedCategory={category ? category.replace('top-20/', '').replace(/-/g, ' ') : undefined} 
          />
        </div>
      )}
      
      {isSearching ? (
        <LoadingState />
      ) : (
        <SearchResults results={searchResults} isSearching={isSearching} />
      )}
    </div>
  );
};