import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { SearchHeader } from "./SearchHeader";
import { LoadingState } from "./LoadingState";
import { locationCodes } from "@/utils/dataForSeoApi";

export const SearchContainer = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (category && city && state) {
      const cleanCategory = category.replace('top-20/', '').replace(/-/g, ' ');
      console.log('Initiating search for:', { cleanCategory, city, state });
      fetchResults(cleanCategory, city, state);
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
      
      // Validate location data
      const stateData = locationCodes[searchState];
      if (!stateData) {
        throw new Error(`Invalid state: ${searchState}`);
      }
      
      const locationCode = stateData.cities[searchCity];
      if (!locationCode) {
        throw new Error(`Invalid city: ${searchCity} for state: ${searchState}`);
      }

      console.log('Using location code:', locationCode);

      // Check cache first
      const { data: cachedResults, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', searchCategory.toLowerCase())
        .eq('city', searchCity)
        .eq('state', searchState)
        .eq('location_code', locationCode)
        .maybeSingle();

      if (cacheError) {
        console.error('Cache fetch error:', cacheError);
        throw cacheError;
      }

      if (cachedResults?.search_results) {
        console.log('Found cached results:', cachedResults.search_results);
        setSearchResults(cachedResults.search_results as SearchResult[]);
      } else {
        console.log('No cache found, fetching from API...');
        // If no cache, invoke the edge function
        const { data: freshResults, error: searchError } = await supabase.functions.invoke('search-vendors', {
          body: { 
            keyword: searchCategory,
            location: `${searchCity}, ${searchState}`
          }
        });

        if (searchError) {
          console.error('Search error:', searchError);
          throw searchError;
        }

        if (freshResults) {
          console.log('Got fresh results:', freshResults);
          setSearchResults(freshResults as SearchResult[]);

          // Cache the new results
          const { error: cacheUpdateError } = await supabase
            .from('vendor_cache')
            .upsert({
              category: searchCategory.toLowerCase(),
              city: searchCity,
              state: searchState,
              location_code: locationCode,
              search_results: freshResults,
            });

          if (cacheUpdateError) {
            console.error('Cache update error:', cacheUpdateError);
            toast({
              title: "Warning",
              description: "Results were found but couldn't be cached. This won't affect your search.",
              variant: "default",
            });
          }
        } else {
          console.log('No results returned from search');
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors. Please try again.",
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