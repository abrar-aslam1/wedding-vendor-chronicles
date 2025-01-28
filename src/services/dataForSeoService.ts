import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { getLocationCode } from "@/config/locations";

interface SearchVendorsParams {
  keyword: string;
  location: string;
  city?: string;
  state?: string;
}

export const searchVendors = async ({
  keyword,
  location,
  city,
  state,
}: SearchVendorsParams): Promise<SearchResult[]> => {
  console.info("Searching vendors:", { keyword, location, city, state });

  try {
    // Check cache first
    const locationCode = getLocationCode(state || "", city || "");
    if (locationCode) {
      const { data: cachedResults } = await supabase
        .from("vendor_cache")
        .select("search_results")
        .eq("category", keyword)
        .eq("location_code", locationCode)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (cachedResults?.search_results) {
        return cachedResults.search_results as SearchResult[];
      }
    }

    // If no cache hit, fetch from edge function
    const response = await fetch("/api/search-vendors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword,
        location,
        locationCode,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const results = await response.json();
    
    // Cache the results if we have a location code
    if (locationCode) {
      await supabase.from("vendor_cache").insert({
        category: keyword,
        location_code: locationCode,
        search_results: results,
        city,
        state,
      });
    }

    return results;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};