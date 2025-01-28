import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { locationCodes } from "@/utils/dataForSeoApi";

const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

export async function searchVendors(category: string, location: string): Promise<SearchResult[]> {
  try {
    const [city, state] = location.split(',').map(part => part.trim());
    
    // Get location code from the mapping
    const stateData = locationCodes[state];
    if (!stateData) {
      throw new Error(`Invalid state: ${state}`);
    }
    
    const locationCode = stateData.cities[city];
    if (!locationCode) {
      throw new Error(`Invalid city: ${city} for state: ${state}`);
    }

    // Check cache first with more specific query
    const { data: cachedResults, error: cacheError } = await supabase
      .from('vendor_cache')
      .select('search_results, created_at')
      .eq('category', category.toLowerCase())
      .eq('city', city.toLowerCase())
      .eq('state', state.toLowerCase())
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

    // Cache the new results with location_code
    const { error: insertError } = await supabase
      .from('vendor_cache')
      .upsert({
        category: category.toLowerCase(),
        city: city.toLowerCase(),
        state: state.toLowerCase(),
        location_code: locationCode,
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