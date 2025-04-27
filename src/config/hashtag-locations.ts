/**
 * Location-specific hashtag data and generation functions
 * 
 * This file contains data and functions for generating location-specific wedding hashtags
 */

interface LocationData {
  stateName: string;
  stateNickname?: string;
  stateAbbreviation: string;
  cities: {
    [key: string]: {
      cityName: string;
      nicknames?: string[];
      landmarks?: string[];
      specialTerms?: string[];
    };
  };
}

// Location data for generating location-specific hashtags
const locationData: { [key: string]: LocationData } = {
  "california": {
    stateName: "California",
    stateNickname: "Golden State",
    stateAbbreviation: "CA",
    cities: {
      "los-angeles": {
        cityName: "Los Angeles",
        nicknames: ["LA", "City of Angels"],
        landmarks: ["Hollywood", "Sunset", "Venice"],
        specialTerms: ["Angels", "Stars", "Palms"]
      },
      "san-francisco": {
        cityName: "San Francisco",
        nicknames: ["SF", "The City", "Frisco"],
        landmarks: ["GoldenGate", "Bay", "Alcatraz"],
        specialTerms: ["Fog", "Hills", "Bay"]
      },
      "san-diego": {
        cityName: "San Diego",
        nicknames: ["SD", "America's Finest City"],
        landmarks: ["Coronado", "Balboa", "LaJolla"],
        specialTerms: ["Sunny", "Beach", "Coastal"]
      }
    }
  },
  "new-york": {
    stateName: "New York",
    stateNickname: "Empire State",
    stateAbbreviation: "NY",
    cities: {
      "new-york-city": {
        cityName: "New York City",
        nicknames: ["NYC", "The Big Apple", "Gotham"],
        landmarks: ["Manhattan", "Brooklyn", "Central"],
        specialTerms: ["Empire", "Metro", "Urban"]
      },
      "buffalo": {
        cityName: "Buffalo",
        nicknames: ["Queen City", "Nickel City"],
        landmarks: ["Niagara", "Erie", "Falls"],
        specialTerms: ["Bison", "Snow", "Wings"]
      },
      "rochester": {
        cityName: "Rochester",
        nicknames: ["Flower City", "ROC"],
        landmarks: ["Eastman", "High Falls", "Lake Ontario"],
        specialTerms: ["Kodak", "Lilac", "Canal"]
      }
    }
  },
  "texas": {
    stateName: "Texas",
    stateNickname: "Lone Star State",
    stateAbbreviation: "TX",
    cities: {
      "austin": {
        cityName: "Austin",
        nicknames: ["ATX", "Live Music Capital"],
        landmarks: ["Capitol", "SoCo", "Zilker"],
        specialTerms: ["Weird", "Music", "Bats"]
      },
      "dallas": {
        cityName: "Dallas",
        nicknames: ["Big D", "Triple D"],
        landmarks: ["Reunion", "Dealey", "Uptown"],
        specialTerms: ["Cowboys", "Stars", "Mavs"]
      },
      "houston": {
        cityName: "Houston",
        nicknames: ["H-Town", "Space City", "Bayou City"],
        landmarks: ["NASA", "Galleria", "Bayou"],
        specialTerms: ["Space", "Rockets", "Astros"]
      }
    }
  },
  "florida": {
    stateName: "Florida",
    stateNickname: "Sunshine State",
    stateAbbreviation: "FL",
    cities: {
      "miami": {
        cityName: "Miami",
        nicknames: ["Magic City", "Vice City"],
        landmarks: ["SouthBeach", "Wynwood", "Brickell"],
        specialTerms: ["Heat", "Tropical", "Ocean"]
      },
      "orlando": {
        cityName: "Orlando",
        nicknames: ["O-Town", "The City Beautiful"],
        landmarks: ["Disney", "Universal", "Epcot"],
        specialTerms: ["Magic", "Theme", "Parks"]
      },
      "tampa": {
        cityName: "Tampa",
        nicknames: ["Cigar City", "Big Guava"],
        landmarks: ["Bayshore", "Ybor", "Busch Gardens"],
        specialTerms: ["Bay", "Pirate", "Gulf"]
      }
    }
  },
  "illinois": {
    stateName: "Illinois",
    stateNickname: "Prairie State",
    stateAbbreviation: "IL",
    cities: {
      "chicago": {
        cityName: "Chicago",
        nicknames: ["Windy City", "Chi-Town", "Second City"],
        landmarks: ["Willis", "Navy", "Millennium"],
        specialTerms: ["Wind", "Lake", "Blues"]
      },
      "springfield": {
        cityName: "Springfield",
        nicknames: ["Flower City", "Lincoln's Home"],
        landmarks: ["Capitol", "Lincoln Home", "Dana-Thomas"],
        specialTerms: ["Capital", "Lincoln", "Prairie"]
      },
      "naperville": {
        cityName: "Naperville",
        nicknames: ["Tree City", "The Nape"],
        landmarks: ["Riverwalk", "Centennial Beach", "Moser Tower"],
        specialTerms: ["River", "Suburb", "Historic"]
      }
    }
  }
};

/**
 * Generate location-specific hashtags based on state and city
 * 
 * @param stateSlug The state slug (e.g., "california")
 * @param citySlug The city slug (e.g., "los-angeles")
 * @param partner1FirstName First partner's first name
 * @param partner2FirstName Second partner's first name
 * @returns Array of location-specific hashtags
 */
export function generateLocationHashtags(
  stateSlug: string,
  citySlug: string,
  partner1FirstName: string,
  partner2FirstName: string
): string[] {
  const hashtags: string[] = [];
  
  // Get location data
  const state = locationData[stateSlug];
  if (!state) return hashtags;
  
  const city = state.cities[citySlug];
  if (!city) return hashtags;
  
  // Generate state-based hashtags
  hashtags.push(`#${partner1FirstName}${partner2FirstName}${state.stateName}`);
  hashtags.push(`#${state.stateName}Wedding`);
  
  if (state.stateNickname) {
    hashtags.push(`#${state.stateNickname}Wedding`);
  }
  
  // Generate city-based hashtags
  hashtags.push(`#${partner1FirstName}${partner2FirstName}${city.cityName.replace(/\s+/g, "")}`);
  hashtags.push(`#${city.cityName.replace(/\s+/g, "")}Wedding`);
  
  // Add nickname-based hashtags
  if (city.nicknames && city.nicknames.length > 0) {
    city.nicknames.forEach(nickname => {
      hashtags.push(`#${nickname.replace(/\s+/g, "")}Wedding`);
      hashtags.push(`#${partner1FirstName}${partner2FirstName}In${nickname.replace(/\s+/g, "")}`);
    });
  }
  
  // Add landmark-based hashtags
  if (city.landmarks && city.landmarks.length > 0) {
    city.landmarks.forEach(landmark => {
      hashtags.push(`#${landmark}Wedding`);
    });
    
    // Pick a random landmark for a more specific hashtag
    const randomLandmark = city.landmarks[Math.floor(Math.random() * city.landmarks.length)];
    hashtags.push(`#${partner1FirstName}${partner2FirstName}At${randomLandmark}`);
  }
  
  // Add special term-based hashtags
  if (city.specialTerms && city.specialTerms.length > 0) {
    // Pick a random special term
    const randomTerm = city.specialTerms[Math.floor(Math.random() * city.specialTerms.length)];
    hashtags.push(`#${randomTerm}${partner1FirstName}${partner2FirstName}`);
    hashtags.push(`#${randomTerm}Wedding`);
  }
  
  // Add combined state abbreviation and city hashtags
  hashtags.push(`#${partner1FirstName}${partner2FirstName}${state.stateAbbreviation}`);
  
  return hashtags;
}

/**
 * Get location data for a specific state and city
 * 
 * @param stateSlug The state slug (e.g., "california")
 * @param citySlug The city slug (e.g., "los-angeles")
 * @returns Location data or undefined if not found
 */
export function getLocationData(stateSlug?: string, citySlug?: string): {
  state?: LocationData,
  city?: LocationData["cities"][string]
} {
  if (!stateSlug) return {};
  
  const state = locationData[stateSlug];
  if (!state) return {};
  
  if (!citySlug) return { state };
  
  const city = state.cities[citySlug];
  if (!city) return { state };
  
  return { state, city };
}

/**
 * Get all available state slugs
 */
export function getAllStatesSlugs(): string[] {
  return Object.keys(locationData);
}

/**
 * Get all available city slugs for a state
 */
export function getCitySlugsForState(stateSlug: string): string[] {
  const state = locationData[stateSlug];
  if (!state) return [];
  
  return Object.keys(state.cities);
}

/**
 * Get wedding statistics for a location
 */
export function getLocationWeddingStats(stateSlug: string, citySlug?: string): {
  averageCost: string;
  popularMonths: string[];
  popularVenues: string[];
  averageGuestCount: number;
} {
  // This would ideally come from a database, but for now we'll use static data
  const defaultStats = {
    averageCost: "$28,000",
    popularMonths: ["June", "September", "October"],
    popularVenues: ["Hotels", "Barns", "Gardens"],
    averageGuestCount: 125
  };
  
  // State-specific stats
  const stateStats: Record<string, typeof defaultStats> = {
    "california": {
      averageCost: "$39,000",
      popularMonths: ["May", "June", "September"],
      popularVenues: ["Wineries", "Beaches", "Historic Estates"],
      averageGuestCount: 130
    },
    "new-york": {
      averageCost: "$48,000",
      popularMonths: ["June", "September", "October"],
      popularVenues: ["Lofts", "Hotels", "Rooftops"],
      averageGuestCount: 135
    },
    "texas": {
      averageCost: "$30,000",
      popularMonths: ["April", "May", "October"],
      popularVenues: ["Ranches", "Barns", "Ballrooms"],
      averageGuestCount: 145
    },
    "florida": {
      averageCost: "$35,000",
      popularMonths: ["November", "February", "March"],
      popularVenues: ["Beaches", "Resorts", "Gardens"],
      averageGuestCount: 120
    },
    "illinois": {
      averageCost: "$33,000",
      popularMonths: ["June", "August", "September"],
      popularVenues: ["Ballrooms", "Lofts", "Historic Buildings"],
      averageGuestCount: 140
    }
  };
  
  // City-specific stats
  const cityStats: Record<string, Record<string, typeof defaultStats>> = {
    "california": {
      "los-angeles": {
        averageCost: "$42,000",
        popularMonths: ["May", "June", "October"],
        popularVenues: ["Beachfront Estates", "Historic Theaters", "Luxury Hotels"],
        averageGuestCount: 135
      },
      "san-francisco": {
        averageCost: "$45,000",
        popularMonths: ["June", "September", "October"],
        popularVenues: ["Wineries", "Historic Buildings", "Bay View Venues"],
        averageGuestCount: 125
      },
      "san-diego": {
        averageCost: "$36,000",
        popularMonths: ["April", "May", "October"],
        popularVenues: ["Beaches", "Resorts", "Gardens"],
        averageGuestCount: 130
      }
    },
    "new-york": {
      "new-york-city": {
        averageCost: "$55,000",
        popularMonths: ["June", "September", "October"],
        popularVenues: ["Rooftops", "Lofts", "Luxury Hotels"],
        averageGuestCount: 130
      },
      "buffalo": {
        averageCost: "$32,000",
        popularMonths: ["June", "August", "September"],
        popularVenues: ["Historic Mansions", "Waterfront", "Gardens"],
        averageGuestCount: 125
      },
      "rochester": {
        averageCost: "$30,000",
        popularMonths: ["June", "July", "September"],
        popularVenues: ["Museums", "Wineries", "Historic Buildings"],
        averageGuestCount: 120
      }
    },
    "texas": {
      "austin": {
        averageCost: "$31,000",
        popularMonths: ["April", "May", "October"],
        popularVenues: ["Hill Country Venues", "Downtown Lofts", "Lakeside Estates"],
        averageGuestCount: 140
      },
      "dallas": {
        averageCost: "$33,000",
        popularMonths: ["April", "May", "October"],
        popularVenues: ["Luxury Hotels", "Country Clubs", "Historic Venues"],
        averageGuestCount: 150
      },
      "houston": {
        averageCost: "$35,000",
        popularMonths: ["March", "April", "October"],
        popularVenues: ["Downtown Hotels", "Country Clubs", "Gardens"],
        averageGuestCount: 155
      }
    },
    "florida": {
      "miami": {
        averageCost: "$38,000",
        popularMonths: ["November", "February", "March"],
        popularVenues: ["Beachfront Resorts", "Luxury Hotels", "Waterfront Estates"],
        averageGuestCount: 125
      },
      "orlando": {
        averageCost: "$33,000",
        popularMonths: ["October", "November", "April"],
        popularVenues: ["Theme Parks", "Resorts", "Gardens"],
        averageGuestCount: 130
      },
      "tampa": {
        averageCost: "$30,000",
        popularMonths: ["October", "November", "April"],
        popularVenues: ["Waterfront Venues", "Historic Buildings", "Gardens"],
        averageGuestCount: 120
      }
    },
    "illinois": {
      "chicago": {
        averageCost: "$37,000",
        popularMonths: ["June", "August", "September"],
        popularVenues: ["Downtown Hotels", "Historic Buildings", "Waterfront Venues"],
        averageGuestCount: 145
      },
      "springfield": {
        averageCost: "$25,000",
        popularMonths: ["May", "June", "September"],
        popularVenues: ["Historic Sites", "Gardens", "Ballrooms"],
        averageGuestCount: 130
      },
      "naperville": {
        averageCost: "$28,000",
        popularMonths: ["June", "August", "September"],
        popularVenues: ["Riverwalk", "Country Clubs", "Historic Buildings"],
        averageGuestCount: 135
      }
    }
  };
  
  // Return city-specific stats if available
  if (stateSlug && citySlug && cityStats[stateSlug]?.[citySlug]) {
    return cityStats[stateSlug][citySlug];
  }
  
  // Return state-specific stats if available
  if (stateSlug && stateStats[stateSlug]) {
    return stateStats[stateSlug];
  }
  
  // Return default stats
  return defaultStats;
}
