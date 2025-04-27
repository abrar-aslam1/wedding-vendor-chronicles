/**
 * Location data for the Wedding Hashtag Generator
 * This file contains state and city information for location-specific hashtag pages
 */

export interface City {
  name: string;
  slug: string;
  population: number;
  weddingVenues: number;
  popularVenues: string[];
  localLandmarks: string[];
  localNicknames: string[];
}

export interface State {
  name: string;
  abbreviation: string;
  slug: string;
  weddingStats: {
    averageCost: number;
    peakSeason: string;
    popularThemes: string[];
  };
  cities: Record<string, City>;
}

export const hashtagLocations: Record<string, State> = {
  "california": {
    name: "California",
    abbreviation: "CA",
    slug: "california",
    weddingStats: {
      averageCost: 39000,
      peakSeason: "June-September",
      popularThemes: ["Beach", "Vineyard", "Rustic"]
    },
    cities: {
      "los-angeles": {
        name: "Los Angeles",
        slug: "los-angeles",
        population: 3990000,
        weddingVenues: 450,
        popularVenues: [
          "Vibiana",
          "Carondelet House",
          "Malibu Rocky Oaks Estate Vineyards"
        ],
        localLandmarks: [
          "Hollywood Sign",
          "Griffith Observatory",
          "Santa Monica Pier"
        ],
        localNicknames: [
          "LA",
          "City of Angels",
          "Tinseltown"
        ]
      },
      "san-francisco": {
        name: "San Francisco",
        slug: "san-francisco",
        population: 883305,
        weddingVenues: 280,
        popularVenues: [
          "San Francisco City Hall",
          "The Fairmont",
          "Legion of Honor"
        ],
        localLandmarks: [
          "Golden Gate Bridge",
          "Alcatraz Island",
          "Fisherman's Wharf"
        ],
        localNicknames: [
          "SF",
          "The City",
          "Fog City"
        ]
      },
      "san-diego": {
        name: "San Diego",
        slug: "san-diego",
        population: 1420000,
        weddingVenues: 320,
        popularVenues: [
          "Hotel Del Coronado",
          "Balboa Park",
          "The Prado"
        ],
        localLandmarks: [
          "San Diego Zoo",
          "Coronado Bridge",
          "Sunset Cliffs"
        ],
        localNicknames: [
          "America's Finest City",
          "SD",
          "City in Motion"
        ]
      }
    }
  },
  "new-york": {
    name: "New York",
    abbreviation: "NY",
    slug: "new-york",
    weddingStats: {
      averageCost: 48000,
      peakSeason: "May-October",
      popularThemes: ["Urban Chic", "Classic Elegance", "Industrial"]
    },
    cities: {
      "new-york-city": {
        name: "New York City",
        slug: "new-york-city",
        population: 8380000,
        weddingVenues: 520,
        popularVenues: [
          "The Plaza Hotel",
          "Brooklyn Botanic Garden",
          "The Rainbow Room"
        ],
        localLandmarks: [
          "Empire State Building",
          "Central Park",
          "Statue of Liberty"
        ],
        localNicknames: [
          "NYC",
          "The Big Apple",
          "Gotham"
        ]
      },
      "buffalo": {
        name: "Buffalo",
        slug: "buffalo",
        population: 278349,
        weddingVenues: 95,
        popularVenues: [
          "Kleinhans Music Hall",
          "The Mansion on Delaware",
          "Hotel Henry"
        ],
        localLandmarks: [
          "Niagara Falls",
          "Buffalo City Hall",
          "Canalside"
        ],
        localNicknames: [
          "The Queen City",
          "The Nickel City",
          "City of Good Neighbors"
        ]
      }
    }
  },
  "texas": {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    weddingStats: {
      averageCost: 30000,
      peakSeason: "March-June, September-November",
      popularThemes: ["Rustic", "Country", "Modern"]
    },
    cities: {
      "austin": {
        name: "Austin",
        slug: "austin",
        population: 964254,
        weddingVenues: 280,
        popularVenues: [
          "The Driskill Hotel",
          "Barr Mansion",
          "Vista West Ranch"
        ],
        localLandmarks: [
          "Texas State Capitol",
          "Lady Bird Lake",
          "Zilker Park"
        ],
        localNicknames: [
          "ATX",
          "Live Music Capital of the World",
          "Silicon Hills"
        ]
      },
      "dallas": {
        name: "Dallas",
        slug: "dallas",
        population: 1345000,
        weddingVenues: 310,
        popularVenues: [
          "The Adolphus Hotel",
          "Arlington Hall",
          "The Joule"
        ],
        localLandmarks: [
          "Reunion Tower",
          "Dallas Arboretum",
          "Dealey Plaza"
        ],
        localNicknames: [
          "Big D",
          "Triple D",
          "The 214"
        ]
      },
      "houston": {
        name: "Houston",
        slug: "houston",
        population: 2310000,
        weddingVenues: 340,
        popularVenues: [
          "The Corinthian",
          "The Bell Tower on 34th",
          "Chateau Cocomar"
        ],
        localLandmarks: [
          "Space Center Houston",
          "Buffalo Bayou Park",
          "Gerald D. Hines Waterwall Park"
        ],
        localNicknames: [
          "H-Town",
          "Bayou City",
          "Space City"
        ]
      }
    }
  },
  "florida": {
    name: "Florida",
    abbreviation: "FL",
    slug: "florida",
    weddingStats: {
      averageCost: 33000,
      peakSeason: "October-May",
      popularThemes: ["Beach", "Tropical", "Garden"]
    },
    cities: {
      "miami": {
        name: "Miami",
        slug: "miami",
        population: 463347,
        weddingVenues: 290,
        popularVenues: [
          "Vizcaya Museum & Gardens",
          "The Biltmore Hotel",
          "The Ancient Spanish Monastery"
        ],
        localLandmarks: [
          "South Beach",
          "Wynwood Walls",
          "Bayside Marketplace"
        ],
        localNicknames: [
          "Magic City",
          "The 305",
          "Vice City"
        ]
      },
      "orlando": {
        name: "Orlando",
        slug: "orlando",
        population: 287442,
        weddingVenues: 240,
        popularVenues: [
          "Walt Disney World",
          "Bella Collina",
          "Casa Feliz"
        ],
        localLandmarks: [
          "Disney World",
          "Universal Studios",
          "Lake Eola Park"
        ],
        localNicknames: [
          "The City Beautiful",
          "O-Town",
          "Theme Park Capital of the World"
        ]
      }
    }
  },
  "illinois": {
    name: "Illinois",
    abbreviation: "IL",
    slug: "illinois",
    weddingStats: {
      averageCost: 35000,
      peakSeason: "May-October",
      popularThemes: ["Urban Chic", "Classic", "Industrial"]
    },
    cities: {
      "chicago": {
        name: "Chicago",
        slug: "chicago",
        population: 2710000,
        weddingVenues: 380,
        popularVenues: [
          "The Drake Hotel",
          "Adler Planetarium",
          "Chicago Cultural Center"
        ],
        localLandmarks: [
          "Cloud Gate (The Bean)",
          "Navy Pier",
          "Willis Tower"
        ],
        localNicknames: [
          "The Windy City",
          "Chi-Town",
          "Second City"
        ]
      }
    }
  }
};

// Helper function to get all states
export const getAllStates = (): State[] => {
  return Object.values(hashtagLocations);
};

// Helper function to get all cities in a state
export const getCitiesInState = (stateSlug: string): City[] => {
  const state = hashtagLocations[stateSlug];
  if (!state) return [];
  return Object.values(state.cities);
};

// Helper function to get a specific city
export const getCity = (stateSlug: string, citySlug: string): City | null => {
  const state = hashtagLocations[stateSlug];
  if (!state) return null;
  return state.cities[citySlug] || null;
};

// Helper function to get a specific state
export const getState = (stateSlug: string): State | null => {
  return hashtagLocations[stateSlug] || null;
};

// Helper function to generate location-specific hashtag ideas
export const generateLocationHashtags = (
  stateSlug: string, 
  citySlug: string, 
  partner1Name: string, 
  partner2Name: string
): string[] => {
  const state = getState(stateSlug);
  const city = getCity(stateSlug, citySlug);
  
  if (!state || !city) return [];
  
  const hashtags: string[] = [];
  
  // City-based hashtags
  hashtags.push(`#${partner1Name}${partner2Name}In${city.name.replace(/\s+/g, '')}`);
  hashtags.push(`#${city.name.replace(/\s+/g, '')}Wedding`);
  
  // Nickname-based hashtags
  if (city.localNicknames && city.localNicknames.length > 0) {
    const nickname = city.localNicknames[0].replace(/\s+/g, '');
    hashtags.push(`#${nickname}Wedding${partner1Name}${partner2Name}`);
  }
  
  // Landmark-based hashtags
  if (city.localLandmarks && city.localLandmarks.length > 0) {
    const landmark = city.localLandmarks[0].replace(/\s+/g, '');
    hashtags.push(`#${landmark}Love`);
  }
  
  // Venue-based hashtags
  if (city.popularVenues && city.popularVenues.length > 0) {
    const venue = city.popularVenues[0].replace(/\s+/g, '');
    hashtags.push(`#${venue}Wedding`);
  }
  
  // State-based hashtags
  hashtags.push(`#${state.name.replace(/\s+/g, '')}Wedding${partner1Name}${partner2Name}`);
  
  return hashtags;
};
