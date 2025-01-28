import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { locationCodes } from "@/config/locations";

export const searchVendors = async (category: string, location: string): Promise<SearchResult[]> => {
  try {
    // Check cache first
    const [city, state] = location.split(", ");
    
    const { data: cachedResults } = await supabase
      .from("vendor_cache")
      .select("search_results")
      .eq("category", category.toLowerCase())
      .eq("city", city.toLowerCase())
      .eq("state", state.toLowerCase())
      .maybeSingle();

    if (cachedResults?.search_results) {
      console.log('Using cached results');
      return cachedResults.search_results as SearchResult[];
    }

    // If no cache hit, call the edge function
    const { data, error } = await supabase.functions.invoke('search-vendors', {
      body: {
        keyword: category,
        location: location,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No results returned from search');
    }

    return data as SearchResult[];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

// This function is used to prefetch data for the current route
export const prefetchCurrentRouteData = async (category: string, city: string, state: string) => {
  try {
    const location = `${city}, ${state}`;
    return await searchVendors(category, location);
  } catch (error) {
    console.error("Prefetch error:", error);
    return null;
  }
};