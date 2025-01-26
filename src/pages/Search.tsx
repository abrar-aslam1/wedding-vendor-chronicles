import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchResults } from "@/components/search/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { prefetchCurrentRouteData } from "@/services/dataForSeoService";

const Search = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (category && city && state) {
      fetchResults();
      // Prefetch data for the current route
      prefetchCurrentRouteData(category, city, state).catch(console.error);
    }
  }, [category, city, state]);

  const fetchResults = async () => {
    setIsSearching(true);
    try {
      console.log('Fetching results for:', { category, city, state });
      
      const query = supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', `${category} in ${city}, ${state}`)
        .eq('city', city.toLowerCase())
        .eq('state', state.toLowerCase());

      const { data: cachedResults, error } = await query.maybeSingle();
      
      console.log('Cache query result:', { cachedResults, error });

      if (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch results. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (cachedResults?.search_results) {
        // Ensure we're setting an array
        const results = Array.isArray(cachedResults.search_results) 
          ? cachedResults.search_results 
          : [];
        console.log('Setting search results:', results);
        setSearchResults(results);
      } else {
        console.log('No results found in cache');
        toast({
          title: "No results found",
          description: "Please try a different search",
          variant: "destructive",
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      <SearchResults results={searchResults} isSearching={isSearching} />
    </div>
  );
};

export default Search;