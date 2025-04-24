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
  const { category, subcategory, city, state } = useParams<{ 
    category: string; 
    subcategory?: string;
    city?: string; 
    state?: string; 
  }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SearchContainer mounted with params:', { category, subcategory, city, state });
    if (city && state) {
      const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
      console.log('Initiating search for:', { cleanCategory, subcategory, city, state });
      fetchResults(cleanCategory, city, state, subcategory);
    }
  }, [category, subcategory, city, state]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string, selectedSubcategory?: string) => {
    console.log('Handling search with:', { 
      selectedCategory, 
      selectedState, 
      selectedCity,
      selectedSubcategory 
    });
    
    const categoryToUse = category 
      ? category.replace('top-20/', '').replace(/-/g, ' ') 
      : selectedCategory;
    
    const formattedCategory = categoryToUse.toLowerCase().replace(/ /g, '-');
    
    const urlPath = selectedSubcategory 
      ? `/top-20/${formattedCategory}/${selectedSubcategory}/${selectedCity}/${selectedState}`
      : `/top-20/${formattedCategory}/${selectedCity}/${selectedState}`;
    
    navigate(urlPath);
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string, subcategory?: string) => {
    console.log('Starting fetchResults with:', { searchCategory, searchCity, searchState, subcategory });
    setIsSearching(true);
    
    try {
      const locationCode = 2840;
      console.log('Using fixed location code:', locationCode);

      // Skip cache if subcategory is provided to ensure fresh, filtered results
      if (!subcategory) {
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
      } else {
        console.log('Bypassing cache for subcategory search:', subcategory);
      }

      console.log('No cache found, fetching from API...');
      
      const { data: freshResults, error: searchError } = await supabase.functions.invoke('search-vendors', {
        body: { 
          keyword: searchCategory,
          location: `${searchCity}, ${searchState}`,
          subcategory: subcategory
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
        console.log('Setting and caching fresh results...');
        setSearchResults(freshResults as SearchResult[]);

        // Only cache results if no subcategory is provided
        if (!subcategory) {
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
          }
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
      <SearchHeader subcategory={subcategory} />
      
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
        <SearchResults results={searchResults} isSearching={isSearching} subcategory={subcategory} />
      )}
    </div>
  );
};
