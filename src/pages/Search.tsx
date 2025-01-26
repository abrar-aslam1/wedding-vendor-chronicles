import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchResults } from "@/components/search/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function getServerSideProps({ params }: { params: { category: string; city?: string; state?: string } }) {
  try {
    const query = supabase
      .from('vendor_cache')
      .select('search_results');

    if (params.city && params.state) {
      query
        .eq('category', params.category)
        .eq('city', params.city.toLowerCase())
        .eq('state', params.state.toLowerCase());
    } else {
      query.eq('category', params.category);
    }

    const { data: cachedResults } = await query.maybeSingle();

    return {
      props: {
        initialData: cachedResults?.search_results || null,
        category: params.category,
        city: params.city,
        state: params.state,
      },
    };
  } catch (error) {
    console.error('Error fetching SSR data:', error);
    return {
      props: {
        initialData: null,
        category: params.category,
        city: params.city,
        state: params.state,
      },
    };
  }
}

const Search = ({ initialData }: { initialData?: any }) => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState(initialData || null);
  const { toast } = useToast();

  useEffect(() => {
    if (!initialData) {
      fetchResults();
    }
  }, [category, city, state, initialData]);

  const fetchResults = async () => {
    try {
      const query = supabase
        .from('vendor_cache')
        .select('search_results');

      if (city && state) {
        query
          .eq('category', category)
          .eq('city', city.toLowerCase())
          .eq('state', state.toLowerCase());
      } else {
        query.eq('category', category);
      }

      const { data: cachedResults } = await query.maybeSingle();

      if (cachedResults?.search_results) {
        setSearchResults(cachedResults.search_results);
      } else {
        toast({
          title: "No results found",
          description: "Please try a different search",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      <SearchResults results={searchResults || []} isSearching={!searchResults} />
    </div>
  );
};

export default Search;