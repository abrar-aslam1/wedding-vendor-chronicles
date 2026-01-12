// Static US States and Cities Data
// This provides reliable location data without database dependencies

export interface USState {
  name: string;
  abbreviation: string;
  cities: string[];
}

export const US_STATES: USState[] = [
  {
    name: "Alabama",
    abbreviation: "AL",
    cities: ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison"]
  },
  {
    name: "Alaska",
    abbreviation: "AK",
    cities: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer"]
  },
  {
    name: "Arizona",
    abbreviation: "AZ",
    cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise", "Sedona", "Flagstaff"]
  },
  {
    name: "Arkansas",
    abbreviation: "AR",
    cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Rogers", "Conway", "North Little Rock", "Bentonville", "Pine Bluff"]
  },
  {
    name: "California",
    abbreviation: "CA",
    cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Moreno Valley", "Santa Clarita", "Glendale", "Huntington Beach", "Garden Grove", "Oceanside", "Rancho Cucamonga", "Santa Rosa", "Ontario", "Elk Grove", "Corona", "Napa", "Pasadena", "Malibu", "Beverly Hills", "Palm Springs", "Carmel", "Santa Barbara", "Monterey", "Laguna Beach"]
  },
  {
    name: "Colorado",
    abbreviation: "CO",
    cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Boulder", "Aspen", "Vail", "Telluride", "Breckenridge", "Estes Park"]
  },
  {
    name: "Connecticut",
    abbreviation: "CT",
    cities: ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury", "New Britain", "Greenwich", "Westport", "Mystic", "Essex"]
  },
  {
    name: "Delaware",
    abbreviation: "DE",
    cities: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Lewes", "Rehoboth Beach"]
  },
  {
    name: "Florida",
    abbreviation: "FL",
    cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines", "Hollywood", "Gainesville", "Coral Springs", "Miami Beach", "Clearwater", "Palm Beach", "West Palm Beach", "Boca Raton", "Naples", "Sarasota", "Fort Myers", "Key West", "Destin", "Pensacola", "Daytona Beach", "St. Augustine"]
  },
  {
    name: "Georgia",
    abbreviation: "GA",
    cities: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Albany", "Alpharetta", "Marietta", "Decatur", "Rome", "Brunswick"]
  },
  {
    name: "Hawaii",
    abbreviation: "HI",
    cities: ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Lahaina", "Kihei", "Wailuku", "Kapaa", "Kona", "Maui"]
  },
  {
    name: "Idaho",
    abbreviation: "ID",
    cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Sun Valley", "Sandpoint"]
  },
  {
    name: "Illinois",
    abbreviation: "IL",
    cities: ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Champaign", "Evanston", "Oak Park", "Galena"]
  },
  {
    name: "Indiana",
    abbreviation: "IN",
    cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Bloomington", "Fishers", "Hammond", "Gary", "Muncie", "Lafayette", "West Lafayette", "Columbus"]
  },
  {
    name: "Iowa",
    abbreviation: "IA",
    cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Ames", "West Des Moines", "Council Bluffs", "Dubuque"]
  },
  {
    name: "Kansas",
    abbreviation: "KS",
    cities: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina"]
  },
  {
    name: "Kentucky",
    abbreviation: "KY",
    cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Richmond", "Georgetown", "Florence", "Elizabethtown", "Frankfort"]
  },
  {
    name: "Louisiana",
    abbreviation: "LA",
    cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma"]
  },
  {
    name: "Maine",
    abbreviation: "ME",
    cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Brunswick", "Augusta", "Kennebunkport", "Bar Harbor", "Camden"]
  },
  {
    name: "Maryland",
    abbreviation: "MD",
    cities: ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Bethesda", "Silver Spring", "Ocean City"]
  },
  {
    name: "Massachusetts",
    abbreviation: "MA",
    cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "New Bedford", "Quincy", "Lynn", "Newton", "Salem", "Plymouth", "Provincetown", "Nantucket", "Martha's Vineyard", "Cape Cod"]
  },
  {
    name: "Michigan",
    abbreviation: "MI",
    cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Troy", "Traverse City", "Mackinac Island", "Holland"]
  },
  {
    name: "Minnesota",
    abbreviation: "MN",
    cities: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "St. Cloud", "Eagan", "Woodbury", "Stillwater"]
  },
  {
    name: "Mississippi",
    abbreviation: "MS",
    cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Oxford", "Natchez"]
  },
  {
    name: "Missouri",
    abbreviation: "MO",
    cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "Blue Springs", "Branson"]
  },
  {
    name: "Montana",
    abbreviation: "MT",
    cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Whitefish", "Big Sky"]
  },
  {
    name: "Nebraska",
    abbreviation: "NE",
    cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "Norfolk", "North Platte", "Columbus"]
  },
  {
    name: "Nevada",
    abbreviation: "NV",
    cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Lake Tahoe", "Boulder City"]
  },
  {
    name: "New Hampshire",
    abbreviation: "NH",
    cities: ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester", "Salem", "Merrimack", "Portsmouth", "Hanover"]
  },
  {
    name: "New Jersey",
    abbreviation: "NJ",
    cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton", "Princeton", "Atlantic City", "Hoboken", "Morristown", "Cape May"]
  },
  {
    name: "New Mexico",
    abbreviation: "NM",
    cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Carlsbad", "Taos"]
  },
  {
    name: "New York",
    abbreviation: "NY",
    cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "Brooklyn", "Manhattan", "Queens", "The Bronx", "Staten Island", "Long Island", "Hamptons", "Montauk", "Saratoga Springs", "Lake Placid", "Ithaca", "Woodstock"]
  },
  {
    name: "North Carolina",
    abbreviation: "NC",
    cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord", "Asheville", "Chapel Hill", "Outer Banks", "Boone"]
  },
  {
    name: "North Dakota",
    abbreviation: "ND",
    cities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton"]
  },
  {
    name: "Ohio",
    abbreviation: "OH",
    cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain", "Athens", "Yellow Springs", "Put-in-Bay"]
  },
  {
    name: "Oklahoma",
    abbreviation: "OK",
    cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond", "Lawton", "Moore", "Midwest City", "Enid", "Stillwater"]
  },
  {
    name: "Oregon",
    abbreviation: "OR",
    cities: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend", "Medford", "Springfield", "Corvallis", "Ashland", "Hood River", "Cannon Beach"]
  },
  {
    name: "Pennsylvania",
    abbreviation: "PA",
    cities: ["Philadelphia", "Pittsburgh", "Allentown", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona", "Erie", "State College", "Gettysburg", "Hershey", "New Hope"]
  },
  {
    name: "Rhode Island",
    abbreviation: "RI",
    cities: ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Newport", "Coventry", "Cumberland", "Bristol", "Narragansett"]
  },
  {
    name: "South Carolina",
    abbreviation: "SC",
    cities: ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Goose Creek", "Hilton Head Island", "Myrtle Beach", "Beaufort", "Kiawah Island"]
  },
  {
    name: "South Dakota",
    abbreviation: "SD",
    cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Deadwood"]
  },
  {
    name: "Tennessee",
    abbreviation: "TN",
    cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Gatlinburg", "Pigeon Forge", "Sevierville"]
  },
  {
    name: "Texas",
    abbreviation: "TX",
    cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie", "McKinney", "Frisco", "Brownsville", "Pasadena", "Killeen", "McAllen", "Midland", "Waco", "Denton", "Abilene", "Odessa", "Beaumont", "Round Rock", "The Woodlands", "Richardson", "Sugar Land", "League City", "Lewisville", "Tyler", "College Station", "San Marcos", "Fredericksburg", "Galveston", "South Padre Island"]
  },
  {
    name: "Utah",
    abbreviation: "UT",
    cities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "St. George", "Ogden", "Layton", "Park City", "Moab"]
  },
  {
    name: "Vermont",
    abbreviation: "VT",
    cities: ["Burlington", "South Burlington", "Rutland", "Essex Junction", "Bennington", "Brattleboro", "Montpelier", "Stowe", "Manchester", "Woodstock"]
  },
  {
    name: "Virginia",
    abbreviation: "VA",
    cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk", "Charlottesville", "Arlington", "Williamsburg", "Fredericksburg", "Lynchburg"]
  },
  {
    name: "Washington",
    abbreviation: "WA",
    cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Spokane Valley", "Federal Way", "Olympia", "Bellingham", "Leavenworth", "Walla Walla"]
  },
  {
    name: "West Virginia",
    abbreviation: "WV",
    cities: ["Charleston", "Huntington", "Parkersburg", "Morgantown", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg"]
  },
  {
    name: "Wisconsin",
    abbreviation: "WI",
    cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire", "Oshkosh", "Janesville", "Lake Geneva", "Door County"]
  },
  {
    name: "Wyoming",
    abbreviation: "WY",
    cities: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Jackson", "Green River", "Evanston", "Cody"]
  },
  {
    name: "Washington D.C.",
    abbreviation: "DC",
    cities: ["Washington"]
  }
];

// Helper function to get all state names
export const getStateNames = (): string[] => {
  return US_STATES.map(state => state.name).sort();
};

// Helper function to get cities for a state
export const getCitiesForState = (stateName: string): string[] => {
  const state = US_STATES.find(s => s.name === stateName);
  return state ? state.cities.sort() : [];
};

// Helper function to search locations
export const searchLocations = (query: string): { type: 'state' | 'city'; name: string; state?: string }[] => {
  const results: { type: 'state' | 'city'; name: string; state?: string }[] = [];
  const lowerQuery = query.toLowerCase();

  // Search states
  US_STATES.forEach(state => {
    if (state.name.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'state', name: state.name });
    }
    // Search cities within each state
    state.cities.forEach(city => {
      if (city.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'city', name: city, state: state.name });
      }
    });
  });

  return results.slice(0, 20); // Limit results
};
