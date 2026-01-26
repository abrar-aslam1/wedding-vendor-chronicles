import { useState, useEffect } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

const GEOLOCATION_CACHE_KEY = 'wvc_user_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  coordinates: GeolocationCoordinates;
  timestamp: number;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    supported: false, // Will be set correctly on mount
  });

  // Check for browser support and cached location on mount
  useEffect(() => {
    // Check if we're in the browser and geolocation is supported
    const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;
    
    setState(prev => ({
      ...prev,
      supported: isSupported,
    }));

    if (!isSupported) return;

    try {
      const cached = localStorage.getItem(GEOLOCATION_CACHE_KEY);
      if (cached) {
        const { coordinates, timestamp }: CachedLocation = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Use cached location if less than 24 hours old
        if (age < CACHE_DURATION) {
          console.log('Using cached location:', coordinates);
          setState(prev => ({
            ...prev,
            coordinates,
            loading: false,
            error: null,
          }));
        } else {
          // Clear expired cache
          localStorage.removeItem(GEOLOCATION_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error reading cached location:', error);
    }
  }, [state.supported]);

  const requestLocation = () => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      console.warn('Geolocation can only be accessed in the browser');
      return;
    }

    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: GeolocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Cache the location
        try {
          const cacheData: CachedLocation = {
            coordinates,
            timestamp: Date.now(),
          };
          localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(cacheData));
          console.log('Location cached successfully');
        } catch (error) {
          console.error('Error caching location:', error);
        }

        setState({
          coordinates,
          loading: false,
          error: null,
          supported: true,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setState({
          coordinates: null,
          loading: false,
          error: errorMessage,
          supported: true,
        });
      },
      {
        enableHighAccuracy: false, // Use false for faster, less battery-intensive results
        timeout: 10000, // 10 seconds
        maximumAge: CACHE_DURATION, // Accept cached position up to 24 hours old
      }
    );
  };

  const clearLocation = () => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(GEOLOCATION_CACHE_KEY);
      } catch (error) {
        console.error('Error clearing cached location:', error);
      }
    }

    setState({
      coordinates: null,
      loading: false,
      error: null,
      supported: state.supported,
    });
  };

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
};
