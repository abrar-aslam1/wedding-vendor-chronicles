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
  "alabama": {
    stateName: "Alabama",
    stateNickname: "Heart of Dixie",
    stateAbbreviation: "AL",
    cities: {
      "birmingham": {
        cityName: "Birmingham",
        nicknames: ["Magic City", "The Ham"],
        landmarks: ["Vulcan", "Railroad Park", "Sloss Furnaces"],
        specialTerms: ["Southern", "Iron", "Magic"]
      },
      "montgomery": {
        cityName: "Montgomery",
        nicknames: ["Capital City", "Gump City"],
        landmarks: ["Capitol", "Civil Rights Memorial", "Riverfront"],
        specialTerms: ["Capital", "Historic", "River"]
      },
      "mobile": {
        cityName: "Mobile",
        nicknames: ["Azalea City", "Port City"],
        landmarks: ["Battleship", "Bellingrath", "Mardi Gras"],
        specialTerms: ["Port", "Azalea", "Gulf"]
      }
    }
  },
  "alaska": {
    stateName: "Alaska",
    stateNickname: "Last Frontier",
    stateAbbreviation: "AK",
    cities: {
      "anchorage": {
        cityName: "Anchorage",
        nicknames: ["City of Lights", "Los Anchorage"],
        landmarks: ["Denali", "Chugach", "Cook Inlet"],
        specialTerms: ["Northern", "Wilderness", "Frontier"]
      },
      "fairbanks": {
        cityName: "Fairbanks",
        nicknames: ["Golden Heart City", "The Interior"],
        landmarks: ["Aurora", "Chena", "Pioneer Park"],
        specialTerms: ["Northern", "Gold", "Lights"]
      },
      "juneau": {
        cityName: "Juneau",
        nicknames: ["Capital City", "Little San Francisco"],
        landmarks: ["Mendenhall", "Mount Roberts", "Glacier"],
        specialTerms: ["Capital", "Glacier", "Coastal"]
      }
    }
  },
  "arizona": {
    stateName: "Arizona",
    stateNickname: "Grand Canyon State",
    stateAbbreviation: "AZ",
    cities: {
      "phoenix": {
        cityName: "Phoenix",
        nicknames: ["Valley of the Sun", "PHX"],
        landmarks: ["Camelback", "Desert Botanical", "Papago"],
        specialTerms: ["Desert", "Sun", "Cactus"]
      },
      "tucson": {
        cityName: "Tucson",
        nicknames: ["Old Pueblo", "Optics Valley"],
        landmarks: ["Saguaro", "Catalina", "Sabino Canyon"],
        specialTerms: ["Desert", "Mountain", "Sunset"]
      },
      "scottsdale": {
        cityName: "Scottsdale",
        nicknames: ["West's Most Western Town", "The West's Beverly Hills"],
        landmarks: ["OldTown", "TPC", "Camelback"],
        specialTerms: ["Resort", "Western", "Luxury"]
      }
    }
  },
  "arkansas": {
    stateName: "Arkansas",
    stateNickname: "Natural State",
    stateAbbreviation: "AR",
    cities: {
      "little-rock": {
        cityName: "Little Rock",
        nicknames: ["Rock Town", "The Rock"],
        landmarks: ["Capitol", "Clinton Library", "River Market"],
        specialTerms: ["Natural", "River", "Capital"]
      },
      "fayetteville": {
        cityName: "Fayetteville",
        nicknames: ["Athens of the Ozarks", "Track Capital"],
        landmarks: ["Dickson", "Razorback Stadium", "Crystal Bridges"],
        specialTerms: ["Ozark", "University", "Arts"]
      },
      "hot-springs": {
        cityName: "Hot Springs",
        nicknames: ["Spa City", "Valley of the Vapors"],
        landmarks: ["Bathhouse Row", "Hot Springs National Park", "Oaklawn"],
        specialTerms: ["Thermal", "Historic", "Spa"]
      }
    }
  },
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
  "colorado": {
    stateName: "Colorado",
    stateNickname: "Centennial State",
    stateAbbreviation: "CO",
    cities: {
      "denver": {
        cityName: "Denver",
        nicknames: ["Mile High City", "Queen City of the Plains"],
        landmarks: ["RedRocks", "Union Station", "Larimer Square"],
        specialTerms: ["Mountain", "Mile High", "Rocky"]
      },
      "colorado-springs": {
        cityName: "Colorado Springs",
        nicknames: ["Olympic City USA", "The Springs"],
        landmarks: ["Garden of the Gods", "Pikes Peak", "Air Force Academy"],
        specialTerms: ["Mountain", "Olympic", "Garden"]
      },
      "boulder": {
        cityName: "Boulder",
        nicknames: ["People's Republic of Boulder", "The Bubble"],
        landmarks: ["Flatirons", "Pearl Street", "Chautauqua"],
        specialTerms: ["Mountain", "Flatiron", "Outdoor"]
      }
    }
  },
  "connecticut": {
    stateName: "Connecticut",
    stateNickname: "Constitution State",
    stateAbbreviation: "CT",
    cities: {
      "hartford": {
        cityName: "Hartford",
        nicknames: ["Insurance Capital", "New England's Rising Star"],
        landmarks: ["Capitol", "Mark Twain House", "Bushnell Park"],
        specialTerms: ["Capital", "Historic", "Insurance"]
      },
      "new-haven": {
        cityName: "New Haven",
        nicknames: ["Elm City", "Cultural Capital"],
        landmarks: ["Yale", "Green", "East Rock"],
        specialTerms: ["Ivy", "Academic", "Coastal"]
      },
      "stamford": {
        cityName: "Stamford",
        nicknames: ["The City That Works", "Lock City"],
        landmarks: ["Harbor Point", "Cove Island", "Mill River"],
        specialTerms: ["Corporate", "Harbor", "Metro"]
      }
    }
  },
  "delaware": {
    stateName: "Delaware",
    stateNickname: "First State",
    stateAbbreviation: "DE",
    cities: {
      "wilmington": {
        cityName: "Wilmington",
        nicknames: ["Chemical Capital", "Corporate Capital"],
        landmarks: ["Brandywine", "Riverfront", "Grand Opera House"],
        specialTerms: ["First", "River", "Corporate"]
      },
      "dover": {
        cityName: "Dover",
        nicknames: ["Capital City", "Chicken Capital"],
        landmarks: ["Legislative Hall", "Dover Downs", "Air Force Base"],
        specialTerms: ["Capital", "Historic", "Colonial"]
      },
      "newark": {
        cityName: "Newark",
        nicknames: ["College Town", "Chemical City"],
        landmarks: ["University of Delaware", "Main Street", "White Clay Creek"],
        specialTerms: ["College", "Academic", "Historic"]
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
  "georgia": {
    stateName: "Georgia",
    stateNickname: "Peach State",
    stateAbbreviation: "GA",
    cities: {
      "atlanta": {
        cityName: "Atlanta",
        nicknames: ["ATL", "The A", "Hotlanta"],
        landmarks: ["Piedmont", "Centennial", "Beltline"],
        specialTerms: ["Peach", "Southern", "Metro"]
      },
      "savannah": {
        cityName: "Savannah",
        nicknames: ["Hostess City", "Forest City"],
        landmarks: ["Forsyth", "River Street", "Tybee"],
        specialTerms: ["Historic", "Southern", "Coastal"]
      },
      "athens": {
        cityName: "Athens",
        nicknames: ["Classic City", "The Athens of the South"],
        landmarks: ["UGA", "The Arch", "Georgia Theatre"],
        specialTerms: ["Bulldog", "Music", "College"]
      }
    }
  },
  "hawaii": {
    stateName: "Hawaii",
    stateNickname: "Aloha State",
    stateAbbreviation: "HI",
    cities: {
      "honolulu": {
        cityName: "Honolulu",
        nicknames: ["Sheltered Bay", "Crossroads of the Pacific"],
        landmarks: ["Waikiki", "Diamond Head", "Pearl Harbor"],
        specialTerms: ["Aloha", "Paradise", "Island"]
      },
      "hilo": {
        cityName: "Hilo",
        nicknames: ["Crescent City", "Gateway to Hawaii Volcanoes"],
        landmarks: ["Mauna Loa", "Rainbow Falls", "Liliuokalani Gardens"],
        specialTerms: ["Volcano", "Tropical", "Rainforest"]
      },
      "kailua": {
        cityName: "Kailua",
        nicknames: ["The Windward Side", "Beach Town"],
        landmarks: ["Lanikai Beach", "Kailua Beach Park", "Pillbox Hike"],
        specialTerms: ["Beach", "Paradise", "Coastal"]
      }
    }
  },
  "idaho": {
    stateName: "Idaho",
    stateNickname: "Gem State",
    stateAbbreviation: "ID",
    cities: {
      "boise": {
        cityName: "Boise",
        nicknames: ["City of Trees", "Treasure Valley"],
        landmarks: ["Capitol", "Boise River", "Table Rock"],
        specialTerms: ["Mountain", "River", "Outdoor"]
      },
      "idaho-falls": {
        cityName: "Idaho Falls",
        nicknames: ["Gateway to Yellowstone", "The Falls"],
        landmarks: ["Snake River", "Greenbelt", "Falls"],
        specialTerms: ["Falls", "River", "Gateway"]
      },
      "coeur-dalene": {
        cityName: "Coeur d'Alene",
        nicknames: ["Lake City", "CDA"],
        landmarks: ["Lake Coeur d'Alene", "Tubbs Hill", "Resort"],
        specialTerms: ["Lake", "Resort", "Mountain"]
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
  },
  "indiana": {
    stateName: "Indiana",
    stateNickname: "Hoosier State",
    stateAbbreviation: "IN",
    cities: {
      "indianapolis": {
        cityName: "Indianapolis",
        nicknames: ["Indy", "Circle City", "Naptown"],
        landmarks: ["Speedway", "Monument Circle", "Canal"],
        specialTerms: ["Racing", "Hoosier", "Circle"]
      },
      "fort-wayne": {
        cityName: "Fort Wayne",
        nicknames: ["Summit City", "City of Churches"],
        landmarks: ["Riverfront", "Embassy Theatre", "Botanical Conservatory"],
        specialTerms: ["Rivers", "Historic", "Summit"]
      },
      "bloomington": {
        cityName: "Bloomington",
        nicknames: ["B-town", "Bloomie"],
        landmarks: ["IU", "Sample Gates", "Kirkwood"],
        specialTerms: ["Hoosier", "College", "Arts"]
      }
    }
  },
  "iowa": {
    stateName: "Iowa",
    stateNickname: "Hawkeye State",
    stateAbbreviation: "IA",
    cities: {
      "des-moines": {
        cityName: "Des Moines",
        nicknames: ["DSM", "Hartford of the West"],
        landmarks: ["Capitol", "Pappajohn Sculpture Park", "East Village"],
        specialTerms: ["Capital", "River", "Heartland"]
      },
      "iowa-city": {
        cityName: "Iowa City",
        nicknames: ["Athens of the Midwest", "Hawkeye City"],
        landmarks: ["Old Capitol", "Pentacrest", "Kinnick Stadium"],
        specialTerms: ["Hawkeye", "Literary", "College"]
      },
      "cedar-rapids": {
        cityName: "Cedar Rapids",
        nicknames: ["City of Five Seasons", "Cedar"],
        landmarks: ["Czech Village", "NewBo", "Paramount Theatre"],
        specialTerms: ["Cedar", "River", "Midwest"]
      }
    }
  },
  "kansas": {
    stateName: "Kansas",
    stateNickname: "Sunflower State",
    stateAbbreviation: "KS",
    cities: {
      "wichita": {
        cityName: "Wichita",
        nicknames: ["Air Capital", "Doo-Dah"],
        landmarks: ["Keeper of the Plains", "Old Town", "Arkansas River"],
        specialTerms: ["Plains", "Sunflower", "Air"]
      },
      "kansas-city": {
        cityName: "Kansas City",
        nicknames: ["KCK", "Dot City"],
        landmarks: ["Legends Outlets", "Kansas Speedway", "Children's Mercy Park"],
        specialTerms: ["BBQ", "Heartland", "Metro"]
      },
      "topeka": {
        cityName: "Topeka",
        nicknames: ["Top City", "Capital City"],
        landmarks: ["Capitol", "Brown v. Board", "Gage Park"],
        specialTerms: ["Capital", "Heartland", "Historic"]
      }
    }
  },
  "kentucky": {
    stateName: "Kentucky",
    stateNickname: "Bluegrass State",
    stateAbbreviation: "KY",
    cities: {
      "louisville": {
        cityName: "Louisville",
        nicknames: ["Derby City", "The Ville"],
        landmarks: ["Churchill Downs", "Louisville Slugger", "Waterfront"],
        specialTerms: ["Derby", "Bourbon", "River"]
      },
      "lexington": {
        cityName: "Lexington",
        nicknames: ["Horse Capital", "Athens of the West"],
        landmarks: ["Keeneland", "Rupp Arena", "Kentucky Horse Park"],
        specialTerms: ["Bluegrass", "Horses", "University"]
      },
      "bowling-green": {
        cityName: "Bowling Green",
        nicknames: ["BG", "Corvette City"],
        landmarks: ["Corvette Museum", "Lost River Cave", "Fountain Square"],
        specialTerms: ["Corvette", "Cave", "Southern"]
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
