/**
 * Location-specific hashtag data and generation functions
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
        nicknames: ["Magic City"],
        landmarks: ["Vulcan"],
        specialTerms: ["Southern"]
      },
      "montgomery": {
        cityName: "Montgomery",
        nicknames: ["Capital City"],
        landmarks: ["Capitol"],
        specialTerms: ["Historic"]
      },
      "mobile": {
        cityName: "Mobile",
        nicknames: ["Azalea City"],
        landmarks: ["Battleship"],
        specialTerms: ["Gulf"]
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
        nicknames: ["City of Lights"],
        landmarks: ["Denali"],
        specialTerms: ["Northern"]
      },
      "fairbanks": {
        cityName: "Fairbanks",
        nicknames: ["Golden Heart"],
        landmarks: ["Aurora"],
        specialTerms: ["Northern"]
      },
      "juneau": {
        cityName: "Juneau",
        nicknames: ["Capital City"],
        landmarks: ["Mendenhall"],
        specialTerms: ["Glacier"]
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
        nicknames: ["Valley of the Sun"],
        landmarks: ["Camelback"],
        specialTerms: ["Desert"]
      },
      "tucson": {
        cityName: "Tucson",
        nicknames: ["Old Pueblo"],
        landmarks: ["Saguaro"],
        specialTerms: ["Desert"]
      },
      "scottsdale": {
        cityName: "Scottsdale",
        nicknames: ["West's Most Western Town"],
        landmarks: ["OldTown"],
        specialTerms: ["Resort"]
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
        nicknames: ["Rock Town"],
        landmarks: ["Capitol"],
        specialTerms: ["River"]
      },
      "fayetteville": {
        cityName: "Fayetteville",
        nicknames: ["Athens of the Ozarks"],
        landmarks: ["Razorback Stadium"],
        specialTerms: ["University"]
      },
      "hot-springs": {
        cityName: "Hot Springs",
        nicknames: ["Spa City"],
        landmarks: ["Bathhouse Row"],
        specialTerms: ["Thermal"]
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
        nicknames: ["LA"],
        landmarks: ["Hollywood"],
        specialTerms: ["Stars"]
      },
      "san-francisco": {
        cityName: "San Francisco",
        nicknames: ["SF"],
        landmarks: ["GoldenGate"],
        specialTerms: ["Fog"]
      },
      "san-diego": {
        cityName: "San Diego",
        nicknames: ["SD"],
        landmarks: ["Coronado"],
        specialTerms: ["Beach"]
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
        nicknames: ["Mile High City"],
        landmarks: ["RedRocks"],
        specialTerms: ["Mountain"]
      },
      "colorado-springs": {
        cityName: "Colorado Springs",
        nicknames: ["Olympic City"],
        landmarks: ["Garden of the Gods"],
        specialTerms: ["Mountain"]
      },
      "boulder": {
        cityName: "Boulder",
        nicknames: ["The Bubble"],
        landmarks: ["Flatirons"],
        specialTerms: ["Outdoor"]
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
        nicknames: ["Insurance Capital"],
        landmarks: ["Capitol"],
        specialTerms: ["Historic"]
      },
      "new-haven": {
        cityName: "New Haven",
        nicknames: ["Elm City"],
        landmarks: ["Yale"],
        specialTerms: ["Academic"]
      },
      "stamford": {
        cityName: "Stamford",
        nicknames: ["The City That Works"],
        landmarks: ["Harbor Point"],
        specialTerms: ["Corporate"]
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
        nicknames: ["Chemical Capital"],
        landmarks: ["Riverfront"],
        specialTerms: ["River"]
      },
      "dover": {
        cityName: "Dover",
        nicknames: ["Capital City"],
        landmarks: ["Legislative Hall"],
        specialTerms: ["Capital"]
      },
      "newark": {
        cityName: "Newark",
        nicknames: ["College Town"],
        landmarks: ["University of Delaware"],
        specialTerms: ["Academic"]
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
        nicknames: ["Magic City"],
        landmarks: ["SouthBeach"],
        specialTerms: ["Tropical"]
      },
      "orlando": {
        cityName: "Orlando",
        nicknames: ["O-Town"],
        landmarks: ["Disney"],
        specialTerms: ["Magic"]
      },
      "tampa": {
        cityName: "Tampa",
        nicknames: ["Cigar City"],
        landmarks: ["Bayshore"],
        specialTerms: ["Bay"]
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
        nicknames: ["ATL"],
        landmarks: ["Piedmont"],
        specialTerms: ["Peach"]
      },
      "savannah": {
        cityName: "Savannah",
        nicknames: ["Hostess City"],
        landmarks: ["Forsyth"],
        specialTerms: ["Historic"]
      },
      "athens": {
        cityName: "Athens",
        nicknames: ["Classic City"],
        landmarks: ["UGA"],
        specialTerms: ["Bulldog"]
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
        nicknames: ["Sheltered Bay"],
        landmarks: ["Waikiki"],
        specialTerms: ["Aloha"]
      },
      "hilo": {
        cityName: "Hilo",
        nicknames: ["Crescent City"],
        landmarks: ["Mauna Loa"],
        specialTerms: ["Volcano"]
      },
      "kailua": {
        cityName: "Kailua",
        nicknames: ["The Windward Side"],
        landmarks: ["Lanikai Beach"],
        specialTerms: ["Beach"]
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
        nicknames: ["City of Trees"],
        landmarks: ["Capitol"],
        specialTerms: ["Mountain"]
      },
      "idaho-falls": {
        cityName: "Idaho Falls",
        nicknames: ["Gateway to Yellowstone"],
        landmarks: ["Snake River"],
        specialTerms: ["Falls"]
      },
      "coeur-dalene": {
        cityName: "Coeur d'Alene",
        nicknames: ["Lake City"],
        landmarks: ["Lake Coeur d'Alene"],
        specialTerms: ["Lake"]
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
        nicknames: ["Windy City"],
        landmarks: ["Willis"],
        specialTerms: ["Wind"]
      },
      "springfield": {
        cityName: "Springfield",
        nicknames: ["Flower City"],
        landmarks: ["Capitol"],
        specialTerms: ["Lincoln"]
      },
      "naperville": {
        cityName: "Naperville",
        nicknames: ["Tree City"],
        landmarks: ["Riverwalk"],
        specialTerms: ["River"]
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
        nicknames: ["Indy"],
        landmarks: ["Speedway"],
        specialTerms: ["Racing"]
      },
      "fort-wayne": {
        cityName: "Fort Wayne",
        nicknames: ["Summit City"],
        landmarks: ["Riverfront"],
        specialTerms: ["Rivers"]
      },
      "bloomington": {
        cityName: "Bloomington",
        nicknames: ["B-town"],
        landmarks: ["IU"],
        specialTerms: ["Hoosier"]
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
        nicknames: ["DSM"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "iowa-city": {
        cityName: "Iowa City",
        nicknames: ["Hawkeye City"],
        landmarks: ["Old Capitol"],
        specialTerms: ["Hawkeye"]
      },
      "cedar-rapids": {
        cityName: "Cedar Rapids",
        nicknames: ["City of Five Seasons"],
        landmarks: ["Czech Village"],
        specialTerms: ["Cedar"]
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
        nicknames: ["Air Capital"],
        landmarks: ["Keeper of the Plains"],
        specialTerms: ["Plains"]
      },
      "kansas-city": {
        cityName: "Kansas City",
        nicknames: ["KCK"],
        landmarks: ["Legends Outlets"],
        specialTerms: ["BBQ"]
      },
      "topeka": {
        cityName: "Topeka",
        nicknames: ["Capital City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
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
        nicknames: ["Derby City"],
        landmarks: ["Churchill Downs"],
        specialTerms: ["Derby"]
      },
      "lexington": {
        cityName: "Lexington",
        nicknames: ["Horse Capital"],
        landmarks: ["Keeneland"],
        specialTerms: ["Bluegrass"]
      },
      "bowling-green": {
        cityName: "Bowling Green",
        nicknames: ["BG"],
        landmarks: ["Corvette Museum"],
        specialTerms: ["Corvette"]
      }
    }
  },
  "louisiana": {
    stateName: "Louisiana",
    stateNickname: "Pelican State",
    stateAbbreviation: "LA",
    cities: {
      "new-orleans": {
        cityName: "New Orleans",
        nicknames: ["NOLA"],
        landmarks: ["French Quarter"],
        specialTerms: ["Jazz"]
      },
      "baton-rouge": {
        cityName: "Baton Rouge",
        nicknames: ["Red Stick"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "lafayette": {
        cityName: "Lafayette",
        nicknames: ["Hub City"],
        landmarks: ["Vermilionville"],
        specialTerms: ["Cajun"]
      }
    }
  },
  "maine": {
    stateName: "Maine",
    stateNickname: "Pine Tree State",
    stateAbbreviation: "ME",
    cities: {
      "portland": {
        cityName: "Portland",
        nicknames: ["Forest City"],
        landmarks: ["Old Port"],
        specialTerms: ["Coastal"]
      },
      "bangor": {
        cityName: "Bangor",
        nicknames: ["Queen City"],
        landmarks: ["Paul Bunyan"],
        specialTerms: ["Northern"]
      },
      "bar-harbor": {
        cityName: "Bar Harbor",
        nicknames: ["Gateway to Acadia"],
        landmarks: ["Acadia"],
        specialTerms: ["Coastal"]
      }
    }
  },
  "maryland": {
    stateName: "Maryland",
    stateNickname: "Old Line State",
    stateAbbreviation: "MD",
    cities: {
      "baltimore": {
        cityName: "Baltimore",
        nicknames: ["Charm City"],
        landmarks: ["Inner Harbor"],
        specialTerms: ["Harbor"]
      },
      "annapolis": {
        cityName: "Annapolis",
        nicknames: ["Sailing Capital"],
        landmarks: ["Naval Academy"],
        specialTerms: ["Capital"]
      },
      "frederick": {
        cityName: "Frederick",
        nicknames: ["Clustered Spires"],
        landmarks: ["Carroll Creek"],
        specialTerms: ["Historic"]
      }
    }
  },
  "massachusetts": {
    stateName: "Massachusetts",
    stateNickname: "Bay State",
    stateAbbreviation: "MA",
    cities: {
      "boston": {
        cityName: "Boston",
        nicknames: ["Beantown"],
        landmarks: ["Fenway"],
        specialTerms: ["Historic"]
      },
      "cambridge": {
        cityName: "Cambridge",
        nicknames: ["The People's Republic"],
        landmarks: ["Harvard"],
        specialTerms: ["Academic"]
      },
      "cape-cod": {
        cityName: "Cape Cod",
        nicknames: ["The Cape"],
        landmarks: ["Provincetown"],
        specialTerms: ["Coastal"]
      }
    }
  },
  "michigan": {
    stateName: "Michigan",
    stateNickname: "Great Lakes State",
    stateAbbreviation: "MI",
    cities: {
      "detroit": {
        cityName: "Detroit",
        nicknames: ["Motor City"],
        landmarks: ["Renaissance Center"],
        specialTerms: ["Motor"]
      },
      "grand-rapids": {
        cityName: "Grand Rapids",
        nicknames: ["Furniture City"],
        landmarks: ["Frederik Meijer Gardens"],
        specialTerms: ["River"]
      },
      "ann-arbor": {
        cityName: "Ann Arbor",
        nicknames: ["A²"],
        landmarks: ["Michigan Stadium"],
        specialTerms: ["University"]
      }
    }
  },
  "minnesota": {
    stateName: "Minnesota",
    stateNickname: "North Star State",
    stateAbbreviation: "MN",
    cities: {
      "minneapolis": {
        cityName: "Minneapolis",
        nicknames: ["City of Lakes"],
        landmarks: ["Stone Arch Bridge"],
        specialTerms: ["Lakes"]
      },
      "saint-paul": {
        cityName: "Saint Paul",
        nicknames: ["Capital City"],
        landmarks: ["Cathedral"],
        specialTerms: ["Capital"]
      },
      "duluth": {
        cityName: "Duluth",
        nicknames: ["Zenith City"],
        landmarks: ["Aerial Lift Bridge"],
        specialTerms: ["Lake"]
      }
    }
  },
  "mississippi": {
    stateName: "Mississippi",
    stateNickname: "Magnolia State",
    stateAbbreviation: "MS",
    cities: {
      "jackson": {
        cityName: "Jackson",
        nicknames: ["Crossroads of the South"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "biloxi": {
        cityName: "Biloxi",
        nicknames: ["Playground of the South"],
        landmarks: ["Lighthouse"],
        specialTerms: ["Gulf"]
      },
      "hattiesburg": {
        cityName: "Hattiesburg",
        nicknames: ["Hub City"],
        landmarks: ["Southern Miss"],
        specialTerms: ["Southern"]
      }
    }
  },
  "missouri": {
    stateName: "Missouri",
    stateNickname: "Show Me State",
    stateAbbreviation: "MO",
    cities: {
      "kansas-city": {
        cityName: "Kansas City",
        nicknames: ["KC"],
        landmarks: ["Country Club Plaza"],
        specialTerms: ["BBQ"]
      },
      "saint-louis": {
        cityName: "Saint Louis",
        nicknames: ["Gateway City"],
        landmarks: ["Gateway Arch"],
        specialTerms: ["Arch"]
      },
      "springfield": {
        cityName: "Springfield",
        nicknames: ["Queen City of the Ozarks"],
        landmarks: ["Bass Pro"],
        specialTerms: ["Ozark"]
      }
    }
  },
  "montana": {
    stateName: "Montana",
    stateNickname: "Treasure State",
    stateAbbreviation: "MT",
    cities: {
      "billings": {
        cityName: "Billings",
        nicknames: ["Magic City"],
        landmarks: ["Rimrocks"],
        specialTerms: ["Mountain"]
      },
      "missoula": {
        cityName: "Missoula",
        nicknames: ["Garden City"],
        landmarks: ["University of Montana"],
        specialTerms: ["Mountain"]
      },
      "bozeman": {
        cityName: "Bozeman",
        nicknames: ["BZN"],
        landmarks: ["Montana State"],
        specialTerms: ["Mountain"]
      }
    }
  },
  "nebraska": {
    stateName: "Nebraska",
    stateNickname: "Cornhusker State",
    stateAbbreviation: "NE",
    cities: {
      "omaha": {
        cityName: "Omaha",
        nicknames: ["Gateway to the West"],
        landmarks: ["Old Market"],
        specialTerms: ["River"]
      },
      "lincoln": {
        cityName: "Lincoln",
        nicknames: ["Star City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "grand-island": {
        cityName: "Grand Island",
        nicknames: ["GI"],
        landmarks: ["Stuhr Museum"],
        specialTerms: ["Prairie"]
      }
    }
  },
  "nevada": {
    stateName: "Nevada",
    stateNickname: "Silver State",
    stateAbbreviation: "NV",
    cities: {
      "las-vegas": {
        cityName: "Las Vegas",
        nicknames: ["Sin City"],
        landmarks: ["Strip"],
        specialTerms: ["Casino"]
      },
      "reno": {
        cityName: "Reno",
        nicknames: ["Biggest Little City"],
        landmarks: ["Truckee River"],
        specialTerms: ["Sierra"]
      },
      "henderson": {
        cityName: "Henderson",
        nicknames: ["Hendo"],
        landmarks: ["Lake Las Vegas"],
        specialTerms: ["Desert"]
      }
    }
  },
  "new-hampshire": {
    stateName: "New Hampshire",
    stateNickname: "Granite State",
    stateAbbreviation: "NH",
    cities: {
      "manchester": {
        cityName: "Manchester",
        nicknames: ["Queen City"],
        landmarks: ["Millyard"],
        specialTerms: ["Historic"]
      },
      "concord": {
        cityName: "Concord",
        nicknames: ["Capital City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "portsmouth": {
        cityName: "Portsmouth",
        nicknames: ["Port City"],
        landmarks: ["Strawbery Banke"],
        specialTerms: ["Coastal"]
      }
    }
  },
  "new-jersey": {
    stateName: "New Jersey",
    stateNickname: "Garden State",
    stateAbbreviation: "NJ",
    cities: {
      "newark": {
        cityName: "Newark",
        nicknames: ["Brick City"],
        landmarks: ["Prudential Center"],
        specialTerms: ["Urban"]
      },
      "jersey-city": {
        cityName: "Jersey City",
        nicknames: ["JC"],
        landmarks: ["Liberty State Park"],
        specialTerms: ["Skyline"]
      },
      "atlantic-city": {
        cityName: "Atlantic City",
        nicknames: ["AC"],
        landmarks: ["Boardwalk"],
        specialTerms: ["Casino"]
      }
    }
  },
  "new-mexico": {
    stateName: "New Mexico",
    stateNickname: "Land of Enchantment",
    stateAbbreviation: "NM",
    cities: {
      "albuquerque": {
        cityName: "Albuquerque",
        nicknames: ["ABQ"],
        landmarks: ["Sandia Mountains"],
        specialTerms: ["Desert"]
      },
      "santa-fe": {
        cityName: "Santa Fe",
        nicknames: ["The City Different"],
        landmarks: ["Plaza"],
        specialTerms: ["Adobe"]
      },
      "las-cruces": {
        cityName: "Las Cruces",
        nicknames: ["City of Crosses"],
        landmarks: ["Organ Mountains"],
        specialTerms: ["Desert"]
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
        nicknames: ["NYC"],
        landmarks: ["Central Park"],
        specialTerms: ["Metro"]
      },
      "buffalo": {
        cityName: "Buffalo",
        nicknames: ["Queen City"],
        landmarks: ["Niagara Falls"],
        specialTerms: ["Lakes"]
      },
      "rochester": {
        cityName: "Rochester",
        nicknames: ["Flower City"],
        landmarks: ["High Falls"],
        specialTerms: ["Lake"]
      }
    }
  },
  "north-carolina": {
    stateName: "North Carolina",
    stateNickname: "Tar Heel State",
    stateAbbreviation: "NC",
    cities: {
      "charlotte": {
        cityName: "Charlotte",
        nicknames: ["Queen City"],
        landmarks: ["Uptown"],
        specialTerms: ["Banking"]
      },
      "raleigh": {
        cityName: "Raleigh",
        nicknames: ["City of Oaks"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "asheville": {
        cityName: "Asheville",
        nicknames: ["Land of the Sky"],
        landmarks: ["Biltmore"],
        specialTerms: ["Mountain"]
      }
    }
  },
  "north-dakota": {
    stateName: "North Dakota",
    stateNickname: "Peace Garden State",
    stateAbbreviation: "ND",
    cities: {
      "fargo": {
        cityName: "Fargo",
        nicknames: ["Gateway to the West"],
        landmarks: ["Red River"],
        specialTerms: ["Prairie"]
      },
      "bismarck": {
        cityName: "Bismarck",
        nicknames: ["Capital City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "grand-forks": {
        cityName: "Grand Forks",
        nicknames: ["The Grand Cities"],
        landmarks: ["University of North Dakota"],
        specialTerms: ["Northern"]
      }
    }
  },
  "ohio": {
    stateName: "Ohio",
    stateNickname: "Buckeye State",
    stateAbbreviation: "OH",
    cities: {
      "columbus": {
        cityName: "Columbus",
        nicknames: ["Arch City"],
        landmarks: ["Ohio State"],
        specialTerms: ["Buckeye"]
      },
      "cleveland": {
        cityName: "Cleveland",
        nicknames: ["Forest City"],
        landmarks: ["Rock Hall"],
        specialTerms: ["Rock"]
      },
      "cincinnati": {
        cityName: "Cincinnati",
        nicknames: ["Queen City"],
        landmarks: ["Fountain Square"],
        specialTerms: ["River"]
      }
    }
  },
  "oklahoma": {
    stateName: "Oklahoma",
    stateNickname: "Sooner State",
    stateAbbreviation: "OK",
    cities: {
      "oklahoma-city": {
        cityName: "Oklahoma City",
        nicknames: ["OKC"],
        landmarks: ["Bricktown"],
        specialTerms: ["Sooner"]
      },
      "tulsa": {
        cityName: "Tulsa",
        nicknames: ["Oil Capital"],
        landmarks: ["Gathering Place"],
        specialTerms: ["Oil"]
      },
      "norman": {
        cityName: "Norman",
        nicknames: ["City of Festivals"],
        landmarks: ["University of Oklahoma"],
        specialTerms: ["Sooner"]
      }
    }
  },
  "oregon": {
    stateName: "Oregon",
    stateNickname: "Beaver State",
    stateAbbreviation: "OR",
    cities: {
      "portland": {
        cityName: "Portland",
        nicknames: ["PDX"],
        landmarks: ["Powell's"],
        specialTerms: ["Rose"]
      },
      "eugene": {
        cityName: "Eugene",
        nicknames: ["Emerald City"],
        landmarks: ["University of Oregon"],
        specialTerms: ["Green"]
      },
      "bend": {
        cityName: "Bend",
        nicknames: ["Outdoor Playground"],
        landmarks: ["Deschutes River"],
        specialTerms: ["Mountain"]
      }
    }
  },
  "pennsylvania": {
    stateName: "Pennsylvania",
    stateNickname: "Keystone State",
    stateAbbreviation: "PA",
    cities: {
      "philadelphia": {
        cityName: "Philadelphia",
        nicknames: ["Philly"],
        landmarks: ["Liberty Bell"],
        specialTerms: ["Liberty"]
      },
      "pittsburgh": {
        cityName: "Pittsburgh",
        nicknames: ["Steel City"],
        landmarks: ["Three Rivers"],
        specialTerms: ["Steel"]
      },
      "harrisburg": {
        cityName: "Harrisburg",
        nicknames: ["Capital City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      }
    }
  },
  "rhode-island": {
    stateName: "Rhode Island",
    stateNickname: "Ocean State",
    stateAbbreviation: "RI",
    cities: {
      "providence": {
        cityName: "Providence",
        nicknames: ["Creative Capital"],
        landmarks: ["WaterFire"],
        specialTerms: ["Creative"]
      },
      "newport": {
        cityName: "Newport",
        nicknames: ["City by the Sea"],
        landmarks: ["Cliff Walk"],
        specialTerms: ["Coastal"]
      },
      "warwick": {
        cityName: "Warwick",
        nicknames: ["The Crossroads"],
        landmarks: ["Oakland Beach"],
        specialTerms: ["Bay"]
      }
    }
  },
  "south-carolina": {
    stateName: "South Carolina",
    stateNickname: "Palmetto State",
    stateAbbreviation: "SC",
    cities: {
      "charleston": {
        cityName: "Charleston",
        nicknames: ["Holy City"],
        landmarks: ["Historic District"],
        specialTerms: ["Historic"]
      },
      "columbia": {
        cityName: "Columbia",
        nicknames: ["Soda City"],
        landmarks: ["Capitol"],
        specialTerms: ["Capital"]
      },
      "greenville": {
        cityName: "Greenville",
        nicknames: ["G-Vegas"],
        landmarks: ["Falls Park"],
        specialTerms: ["Falls"]
      }
    }
  },
  "south-dakota": {
    stateName: "South Dakota",
    stateNickname: "Mount Rushmore State",
    stateAbbreviation: "SD",
    cities: {
      "sioux-falls": {
        cityName: "Sioux Falls",
        nicknames: ["
