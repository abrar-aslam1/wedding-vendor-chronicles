import { useState, useEffect, useMemo } from 'react';
import { getStateNames, getCitiesForState } from '../data/usLocations';

export interface StaticLocationData {
  location_code: number;
  location_name: string;
  location_type: 'state' | 'city';
}

/**
 * Hook to get all US states (static data)
 */
export function useStaticStates() {
  const [loading, setLoading] = useState(true);

  const states: StaticLocationData[] = useMemo(() => {
    const stateNames = getStateNames();
    return stateNames.map((name, index) => ({
      location_code: index + 1,
      location_name: name,
      location_type: 'state' as const,
    }));
  }, []);

  useEffect(() => {
    // Simulate a brief loading state for UX consistency
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return { states, loading, error: null };
}

/**
 * Hook to get cities for a specific state (static data)
 */
export function useStaticCities(stateName: string | null) {
  const [loading, setLoading] = useState(false);

  const cities: StaticLocationData[] = useMemo(() => {
    if (!stateName) return [];
    
    const cityNames = getCitiesForState(stateName);
    return cityNames.map((name, index) => ({
      location_code: index + 1000,
      location_name: name,
      location_type: 'city' as const,
    }));
  }, [stateName]);

  useEffect(() => {
    if (stateName) {
      setLoading(true);
      // Brief loading state for UX consistency
      const timer = setTimeout(() => setLoading(false), 50);
      return () => clearTimeout(timer);
    }
  }, [stateName]);

  return { cities, loading, error: null };
}

/**
 * Combined hook for backwards compatibility with existing code
 */
export function useStates() {
  return useStaticStates();
}

export function useCities(stateName: string | null) {
  return useStaticCities(stateName);
}
