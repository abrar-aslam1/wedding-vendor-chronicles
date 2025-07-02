import { useState, useEffect } from 'react';
import { locationService, LocationData } from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';

export function useStates() {
  const [states, setStates] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const data = await locationService.getStates();
        setStates(data);
        setError(null);
      } catch (err) {
        setError('Failed to load states');
        console.error('Error loading states:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { states, loading, error };
}

export function useCities(stateName: string | null) {
  const [cities, setCities] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateName) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await locationService.getCitiesForState(stateName);
        setCities(data);
        setError(null);
      } catch (err) {
        setError('Failed to load cities');
        console.error('Error loading cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [stateName]);

  return { cities, loading, error };
}

export function useLocationSearch() {
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await locationService.searchLocations(query);
      setResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, search };
}

export function useLocationSync() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const syncLocations = async (forceRefresh: boolean = false) => {
    try {
      setSyncing(true);
      const result = await locationService.syncLocations(forceRefresh);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync locations',
        variant: 'destructive',
      });
      return { success: false, message: 'Failed to sync locations' };
    } finally {
      setSyncing(false);
    }
  };

  return { syncLocations, syncing };
}