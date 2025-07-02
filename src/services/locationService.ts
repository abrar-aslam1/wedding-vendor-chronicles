import { supabase } from '@/integrations/supabase/client';

export interface LocationData {
  location_code: number;
  location_name: string;
  location_type: 'country' | 'state' | 'city';
  parent_location_code?: number;
  state_code?: string;
  state_name?: string;
  country_code: string;
  latitude?: number;
  longitude?: number;
  metadata?: any;
}

export interface StateWithCities {
  state: LocationData;
  cities: LocationData[];
}

class LocationService {
  private locationsCache: Map<string, LocationData> = new Map();
  private statesCache: LocationData[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all US states from the database
   */
  async getStates(): Promise<LocationData[]> {
    // Return cached data if available and fresh
    if (this.statesCache && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
      return this.statesCache;
    }

    try {
      const { data, error } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .eq('location_type', 'state')
        .eq('country_code', 'US')
        .order('location_name');

      if (error) throw error;

      this.statesCache = data || [];
      this.lastFetchTime = Date.now();

      // Update cache map
      this.statesCache.forEach(state => {
        this.locationsCache.set(`state:${state.location_name}`, state);
      });

      return this.statesCache;
    } catch (error) {
      console.error('Error fetching states:', error);
      // Fall back to hardcoded states if database fails
      return this.getFallbackStates();
    }
  }

  /**
   * Get cities for a specific state
   */
  async getCitiesForState(stateName: string): Promise<LocationData[]> {
    const cacheKey = `cities:${stateName}`;
    
    try {
      // First, get the state to find its location code
      const state = await this.getStateByName(stateName);
      if (!state) return [];

      const { data, error } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .eq('location_type', 'city')
        .eq('parent_location_code', state.location_code)
        .order('location_name');

      if (error) throw error;

      const cities = data || [];

      // Update cache
      cities.forEach(city => {
        this.locationsCache.set(`city:${city.location_name}:${stateName}`, city);
      });

      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Fall back to hardcoded cities if database fails
      return this.getFallbackCities(stateName);
    }
  }

  /**
   * Get a specific state by name
   */
  async getStateByName(stateName: string): Promise<LocationData | null> {
    const cacheKey = `state:${stateName}`;
    
    // Check cache first
    if (this.locationsCache.has(cacheKey)) {
      return this.locationsCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .eq('location_type', 'state')
        .eq('location_name', stateName)
        .single();

      if (error) throw error;

      if (data) {
        this.locationsCache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching state:', error);
      return null;
    }
  }

  /**
   * Get a specific city by name and state
   */
  async getCityByNameAndState(cityName: string, stateName: string): Promise<LocationData | null> {
    const cacheKey = `city:${cityName}:${stateName}`;
    
    // Check cache first
    if (this.locationsCache.has(cacheKey)) {
      return this.locationsCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .eq('location_type', 'city')
        .eq('location_name', cityName)
        .eq('state_name', stateName)
        .single();

      if (error) throw error;

      if (data) {
        this.locationsCache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching city:', error);
      return null;
    }
  }

  /**
   * Search locations by name (for autocomplete)
   */
  async searchLocations(query: string, limit: number = 10): Promise<LocationData[]> {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .or(`location_name.ilike.%${query}%`)
        .in('location_type', ['state', 'city'])
        .limit(limit)
        .order('location_type', { ascending: false }) // States first, then cities
        .order('location_name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  /**
   * Get location code for a given location string (e.g., "Dallas, TX")
   */
  async getLocationCode(location: string): Promise<number> {
    // Default to US if no specific location found
    const defaultCode = 2840;

    if (!location) return defaultCode;

    // Parse location string
    const parts = location.split(',').map(p => p.trim());
    
    if (parts.length === 2) {
      const [city, state] = parts;
      
      // Try to find city first
      const cityData = await this.getCityByNameAndState(city, state);
      if (cityData) return cityData.location_code;

      // Fall back to state
      const stateData = await this.getStateByName(state);
      if (stateData) return stateData.location_code;
    } else if (parts.length === 1) {
      // Try as state
      const stateData = await this.getStateByName(parts[0]);
      if (stateData) return stateData.location_code;
    }

    return defaultCode;
  }

  /**
   * Sync locations from DataForSEO API
   */
  async syncLocations(forceRefresh: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-dataforseo-locations', {
        body: { 
          locationType: 'us_only',
          forceRefresh 
        }
      });

      if (error) throw error;

      // Clear cache after sync
      this.locationsCache.clear();
      this.statesCache = null;
      this.lastFetchTime = 0;

      return data;
    } catch (error) {
      console.error('Error syncing locations:', error);
      return { 
        success: false, 
        message: 'Failed to sync locations' 
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_dataforseo_cache_stats');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      return null;
    }
  }

  /**
   * Fallback states data (subset of most important states)
   */
  private getFallbackStates(): LocationData[] {
    return [
      { location_code: 1003522, location_name: 'California', location_type: 'state', country_code: 'US', state_code: 'CA' },
      { location_code: 1003560, location_name: 'Texas', location_type: 'state', country_code: 'US', state_code: 'TX' },
      { location_code: 1003526, location_name: 'Florida', location_type: 'state', country_code: 'US', state_code: 'FL' },
      { location_code: 1003549, location_name: 'New York', location_type: 'state', country_code: 'US', state_code: 'NY' },
      { location_code: 1003530, location_name: 'Illinois', location_type: 'state', country_code: 'US', state_code: 'IL' },
    ];
  }

  /**
   * Fallback cities data (subset of major cities)
   */
  private getFallbackCities(stateName: string): LocationData[] {
    const citiesByState: Record<string, LocationData[]> = {
      'Texas': [
        { location_code: 1003735, location_name: 'Dallas', location_type: 'city', state_name: 'Texas', country_code: 'US' },
        { location_code: 1003811, location_name: 'Houston', location_type: 'city', state_name: 'Texas', country_code: 'US' },
        { location_code: 1003550, location_name: 'Austin', location_type: 'city', state_name: 'Texas', country_code: 'US' },
      ],
      'California': [
        { location_code: 1003910, location_name: 'Los Angeles', location_type: 'city', state_name: 'California', country_code: 'US' },
        { location_code: 1004109, location_name: 'San Francisco', location_type: 'city', state_name: 'California', country_code: 'US' },
        { location_code: 1004102, location_name: 'San Diego', location_type: 'city', state_name: 'California', country_code: 'US' },
      ],
      'Florida': [
        { location_code: 1003937, location_name: 'Miami', location_type: 'city', state_name: 'Florida', country_code: 'US' },
        { location_code: 1004004, location_name: 'Orlando', location_type: 'city', state_name: 'Florida', country_code: 'US' },
        { location_code: 1004145, location_name: 'Tampa', location_type: 'city', state_name: 'Florida', country_code: 'US' },
      ],
    };

    return citiesByState[stateName] || [];
  }
}

// Export singleton instance
export const locationService = new LocationService();