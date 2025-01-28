import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { locationCodes } from "@/config/locations";

export async function searchVendors(category: string, location: string): Promise<SearchResult[]> {
  try {
    // Check cache first
    const { data: cachedResults } = await supabase
      .from('vendor_cache')
      .select('search_results')
      .eq('category', category.toLowerCase())
      .eq('city', location.split(',')[0].trim().toLowerCase())
      .eq('state', location.split(',')[1]?.trim().toLowerCase())
      .maybeSingle();

    if (cachedResults?.search_results) {
      console.log('Using cached results');
      return cachedResults.search_results as SearchResult[];
    }

    console.log('Calling edge function with:', { category, location });
    
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

    console.log('Edge function response:', data);
    return data as SearchResult[];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}