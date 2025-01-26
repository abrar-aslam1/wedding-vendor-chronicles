import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchForm } from "@/components/search/SearchForm";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { searchVendors } from "@/utils/dataForSeoApi";
import { toast } from "@/components/ui/use-toast";

export const SearchSection = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const formatUrlSegment = (text: string) => {
    return text.toLowerCase().replace(/\s+&?\s+/g, "_");
  };

  const handleSearch = async (category: string, state: string, city: string) => {
    try {
      setIsSearching(true);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error("Authentication error occurred");
      }

      if (!session?.user) {
        console.log('No session or user found');
        toast({
          title: "Authentication required",
          description: "Please sign in to search for vendors",
          variant: "destructive",
        });
        return;
      }

      // Check cache first
      const locationString = `${city}, ${state}`;
      
      const { data: cachedResults } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', category.toLowerCase())
        .eq('city', city.toLowerCase())
        .eq('state', state.toLowerCase())
        .maybeSingle();

      if (cachedResults?.search_results && Array.isArray(cachedResults.search_results)) {
        console.log('Using cached results');
        setSearchResults(cachedResults.search_results as SearchResult[]);
        
        // Format URL segments and navigate
        const formattedCategory = formatUrlSegment(category);
        const formattedCity = formatUrlSegment(city);
        const formattedState = formatUrlSegment(state);
        navigate(`/top-20/${formattedCategory}/${formattedCity}/${formattedState}`);
        
        toast({
          title: "Results found",
          description: `Found ${(cachedResults.search_results as SearchResult[]).length} vendors in ${locationString}`,
        });
        return;
      }

      // If no cache, perform search
      const results = await searchVendors(category.toLowerCase(), locationString);
      
      if (!results?.tasks?.[0]?.result?.[0]?.items) {
        toast({
          title: "No results found",
          description: "Try searching in a different location",
          variant: "destructive",
        });
        return;
      }

      const items = results.tasks[0].result[0].items;
      
      const processedResults = items.map((item: any) => ({
        title: item.title,
        description: item.snippet,
        rating: item.rating,
        phone: item.phone_number,
        address: item.address,
        url: item.url,
        place_id: item.place_id
      }));
      
      // Format URL segments and navigate
      const formattedCategory = formatUrlSegment(category);
      const formattedCity = formatUrlSegment(city);
      const formattedState = formatUrlSegment(state);
      navigate(`/top-20/${formattedCategory}/${formattedCity}/${formattedState}`);
      
      setSearchResults(processedResults);
      
      toast({
        title: "Search completed",
        description: `Found ${processedResults.length} vendors in ${locationString}`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Error searching vendors",
        description: error.message || "An error occurred while searching",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative -mt-20 z-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          <div className="mt-8">
            <SearchResults results={searchResults} isSearching={isSearching} />
          </div>
        </div>
      </div>
    </section>
  );
};