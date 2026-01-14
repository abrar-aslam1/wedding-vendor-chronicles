import { US_STATES } from '@/data/usLocations';
import { cityCoordinates } from './cityCoordinates';

export interface NearestCity {
  city: string;
  state: string;
  stateAbbreviation: string;
  distance: number; // in kilometers
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest city from the user's coordinates
 */
export function findNearestCity(
  userLat: number,
  userLon: number
): NearestCity | null {
  let nearestCity: NearestCity | null = null;
  let minDistance = Infinity;

  // Search through all cities with coordinates
  for (const [cityKey, coords] of Object.entries(cityCoordinates)) {
    const distance = calculateDistance(
      userLat,
      userLon,
      coords.latitude,
      coords.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;

      // Parse city key format: "City, State" or "City,State"
      const [cityName, stateAbbr] = cityKey.split(',').map((s) => s.trim());

      // Find the full state name
      const state = US_STATES.find((s) => s.abbreviation === stateAbbr);

      if (state) {
        nearestCity = {
          city: cityName,
          state: state.name,
          stateAbbreviation: stateAbbr,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        };
      }
    }
  }

  return nearestCity;
}

/**
 * Format location for display
 */
export function formatLocation(nearestCity: NearestCity): string {
  return `${nearestCity.city}, ${nearestCity.stateAbbreviation}`;
}

/**
 * Convert city and state to URL-friendly format
 */
export function locationToUrlParams(city: string, state: string): {
  citySlug: string;
  stateSlug: string;
} {
  return {
    citySlug: city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    stateSlug: state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
  };
}

/**
 * Check if city exists in our database
 */
export function isCitySupported(city: string, state: string): boolean {
  const stateData = US_STATES.find((s) => s.name === state);
  if (!stateData) return false;

  return stateData.cities.some(
    (c) => c.toLowerCase() === city.toLowerCase()
  );
}
