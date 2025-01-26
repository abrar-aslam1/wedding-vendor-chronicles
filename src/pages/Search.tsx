import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchResults } from "@/components/search/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function getServerSideProps({ params }: { params: { category: string } }) {
  try {
    const { data: cachedResults } = await supabase
      .from('vendor_cache')
      .select('search_results')
      .eq('category', params.category)
      .single();

    return {
      props: {
        initialData: cachedResults?.search_results || null,
        category: params.category,
      },
    };
  } catch (error) {
    console.error('Error fetching SSR data:', error);
    return {
      props: {
        initialData: null,
        category: params.category,
      },
    };
  }
}

const Search = ({ initialData }: { initialData?: any }) => {
  const { category } = useParams<{ category: string }>();
  const [searchResults, setSearchResults] = useState(initialData || null);
  const { toast } = useToast();

  useEffect(() => {
    if (!initialData) {
      fetchResults();
    }
  }, [category, initialData]);

  const fetchResults = async () => {
    try {
      const { data: cachedResults } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', category)
        .single();

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