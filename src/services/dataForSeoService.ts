import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { locationCodes } from "@/config/locations";

const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

export async function searchVendors(category: string, location: string): Promise<SearchResult[]> {
  try {
    const [city, state] = location.split(',').map(part => part.trim().toLowerCase());
    
    // Check cache first with more specific query
    const { data: cachedResults, error: cacheError } = await supabase
      .from('vendor_cache')
      .select('search_results, created_at')
      .eq('category', category.toLowerCase())
      .eq('city', city)
      .eq('state', state)
      .maybeSingle();

    // If we have valid cached results that aren't expired, return them
    if (cachedResults?.search_results && Array.isArray(cachedResults.search_results)) {
      const cacheAge = Date.now() - new Date(cachedResults.created_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached results from', new Date(cachedResults.created_at));
        return cachedResults.search_results as SearchResult[];
      }
    }

    console.log('Calling edge function with:', { category, location });
    
    // If no cache hit or cache expired, call the edge function
    const { data, error } = await supabase.functions.invoke('search-vendors', {
      body: { keyword: category, location },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No results returned from search');
    }

    // Cache the new results
    const { error: insertError } = await supabase
      .from('vendor_cache')
      .upsert({
        category: category.toLowerCase(),
        city,
        state,
        search_results: data,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + CACHE_DURATION).toISOString()
      });

    if (insertError) {
      console.error('Cache update error:', insertError);
    }

    return data as SearchResult[];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

export async function prefetchCurrentRouteData(category: string, city: string, state: string): Promise<void> {
  try {
    const location = `${city}, ${state}`;
    await searchVendors(category, location);
  } catch (error) {
    console.error("Prefetch error:", error);
  }
}