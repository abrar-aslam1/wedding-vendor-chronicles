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
      return cachedResults.search_results as SearchResult[];
    }

    // If no cache hit, fetch from API
    const response = await fetch("/api/search-vendors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: category,
        location,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const results = await response.json();
    return results;
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