import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    console.log('SearchContainer mounted with params:', { category, city, state });
    if (category && city && state) {
      const cleanCategory = category.replace('top-20/', '').replace(/-/g, ' ');
      console.log('Initiating search for:', { cleanCategory, city, state });
      fetchResults(cleanCategory, city, state);
    }
  }, [category, city, state]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string, subcategory?: string) => {
    console.log('Handling search with:', { 
      selectedCategory, 
      selectedState, 
      selectedCity,
      subcategory 
    });
    
    const categoryToUse = category 
      ? category.replace('top-20/', '').replace(/-/g, ' ') 
      : selectedCategory;
    
    const formattedCategory = categoryToUse.toLowerCase().replace(/ /g, '-');
    
    navigate(`/top-20/${formattedCategory}/${selectedCity}/${selectedState}`);
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string, subcategory?: string) => {
    console.log('Starting fetchResults with:', { searchCategory, searchCity, searchState, subcategory });
    setIsSearching(true);
    
    try {
      // Always use location code 2840
      const locationCode = 2840;
      console.log('Using fixed location code:', locationCode);

      // Check cache first
      console.log('Checking cache for:', {
        category: searchCategory.toLowerCase(),
        city: searchCity,
        state: searchState,
        locationCode,
        subcategory
      });

      const { data: cachedResults, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('*')
        .eq('category', searchCategory.toLowerCase())
        .eq('city', searchCity)
        .eq('state', searchState)
        .eq('location_code', locationCode)
        .maybeSingle();

      console.log('Cache query response:', { 
        cachedResults, 
        cacheError,
        cacheHit: !!cachedResults?.search_results,
        cacheTimestamp: cachedResults?.created_at,
        cacheExpiry: cachedResults?.expires_at
      });

      if (cacheError) {
        console.error('Cache fetch error:', cacheError);
        throw cacheError;
      }

      if (cachedResults?.search_results) {
        console.log('Using cached results from:', new Date(cachedResults.created_at).toLocaleString());
        setSearchResults(cachedResults.search_results as SearchResult[]);
        setIsSearching(false);
        return;
      }

      console.log('No cache found, fetching from API...');
      
      // If no cache, invoke the edge function
      const { data: freshResults, error: searchError } = await supabase.functions.invoke('search-vendors', {
        body: { 
          keyword: searchCategory,
          location: `${searchCity}, ${searchState}`,
          subcategory: subcategory // Pass the subcategory to the edge function
        }
      });

      console.log('API search response:', { 
        resultsCount: freshResults?.length,
        searchError
      });

      if (searchError) {
        console.error('Search error:', searchError);
        throw searchError;
      }

      if (freshResults && Array.isArray(freshResults)) {
        console.log('Caching fresh results...');
        setSearchResults(freshResults as SearchResult[]);

        // Cache the results
        const { error: upsertError } = await supabase
          .from('vendor_cache')
          .upsert(
            {
              category: searchCategory.toLowerCase(),
              city: searchCity,
              state: searchState,
              location_code: locationCode,
              search_results: freshResults,
            },
            {
              onConflict: 'category,city,state,location_code'
            }
          );

        if (upsertError) {
          console.error('Cache upsert error:', upsertError);
          toast({
            title: "Warning",
            description: "Results were found but couldn't be cached. This won't affect your search.",
            variant: "default",
          });
        } else {
          console.log('Successfully cached results');
        }
      } else {
        console.log('No results or invalid results format:', freshResults);
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No vendors found for your search criteria.",
          variant: "default",
        });
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