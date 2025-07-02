export interface StateInfo {
  code: string;
  name: string;
  slug: string;
  region: string;
  majorCities: string[];
  isActive: boolean;
  weddingSeasonPeak: string;
  popularVenueTypes: string[];
}

export const US_REGIONS = {
  SOUTH: 'South',
  WEST: 'West',
  NORTHEAST: 'Northeast',
  MIDWEST: 'Midwest'
} as const;

export const ALL_STATES: StateInfo[] = [
  // South
  { code: 'AL', name: 'Alabama', slug: 'alabama', region: US_REGIONS.SOUTH, majorCities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Rustic Barns'] },
  { code: 'AR', name: 'Arkansas', slug: 'arkansas', region: US_REGIONS.SOUTH, majorCities: ['Little Rock', 'Fayetteville', 'Fort Smith'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Outdoor Venues', 'Rustic Barns', 'Historic Venues'] },
  { code: 'DE', name: 'Delaware', slug: 'delaware', region: US_REGIONS.SOUTH, majorCities: ['Wilmington', 'Dover', 'Newark'], isActive: true, weddingSeasonPeak: 'Spring/Summer', popularVenueTypes: ['Beach Venues', 'Historic Venues', 'Garden Venues'] },
  { code: 'FL', name: 'Florida', slug: 'florida', region: US_REGIONS.SOUTH, majorCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'], isActive: true, weddingSeasonPeak: 'Winter/Spring', popularVenueTypes: ['Beach Venues', 'Resort Venues', 'Garden Venues'] },
  { code: 'GA', name: 'Georgia', slug: 'georgia', region: US_REGIONS.SOUTH, majorCities: ['Atlanta', 'Savannah', 'Augusta', 'Athens'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Rustic Barns'] },
  { code: 'KY', name: 'Kentucky', slug: 'kentucky', region: US_REGIONS.SOUTH, majorCities: ['Louisville', 'Lexington', 'Bowling Green'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Rustic Barns', 'Historic Venues', 'Outdoor Venues'] },
  { code: 'LA', name: 'Louisiana', slug: 'louisiana', region: US_REGIONS.SOUTH, majorCities: ['New Orleans', 'Baton Rouge', 'Shreveport'], isActive: true, weddingSeasonPeak: 'Fall/Winter', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Unique Venues'] },
  { code: 'MD', name: 'Maryland', slug: 'maryland', region: US_REGIONS.SOUTH, majorCities: ['Baltimore', 'Annapolis', 'Frederick'], isActive: true, weddingSeasonPeak: 'Spring/Summer', popularVenueTypes: ['Historic Venues', 'Waterfront Venues', 'Garden Venues'] },
  { code: 'MS', name: 'Mississippi', slug: 'mississippi', region: US_REGIONS.SOUTH, majorCities: ['Jackson', 'Gulfport', 'Biloxi'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Beach Venues'] },
  { code: 'NC', name: 'North Carolina', slug: 'north-carolina', region: US_REGIONS.SOUTH, majorCities: ['Charlotte', 'Raleigh', 'Durham'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Mountain Venues', 'Beach Venues', 'Historic Venues'] },
  { code: 'OK', name: 'Oklahoma', slug: 'oklahoma', region: US_REGIONS.SOUTH, majorCities: ['Oklahoma City', 'Tulsa', 'Norman'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Rustic Barns', 'Outdoor Venues', 'Historic Venues'] },
  { code: 'SC', name: 'South Carolina', slug: 'south-carolina', region: US_REGIONS.SOUTH, majorCities: ['Columbia', 'Charleston', 'Myrtle Beach'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Historic Venues', 'Beach Venues', 'Garden Venues'] },
  { code: 'TN', name: 'Tennessee', slug: 'tennessee', region: US_REGIONS.SOUTH, majorCities: ['Nashville', 'Memphis', 'Knoxville'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Rustic Barns', 'Historic Venues', 'Music Venues'] },
  { code: 'TX', name: 'Texas', slug: 'texas', region: US_REGIONS.SOUTH, majorCities: ['Dallas', 'Houston', 'Austin', 'San Antonio'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Rustic Barns', 'Historic Venues', 'Outdoor Venues'] },
  { code: 'VA', name: 'Virginia', slug: 'virginia', region: US_REGIONS.SOUTH, majorCities: ['Richmond', 'Virginia Beach', 'Norfolk'], isActive: true, weddingSeasonPeak: 'Spring/Summer', popularVenueTypes: ['Historic Venues', 'Vineyard Venues', 'Beach Venues'] },
  { code: 'WV', name: 'West Virginia', slug: 'west-virginia', region: US_REGIONS.SOUTH, majorCities: ['Charleston', 'Huntington', 'Morgantown'], isActive: true, weddingSeasonPeak: 'Spring/Summer', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Historic Venues'] },

  // West
  { code: 'AK', name: 'Alaska', slug: 'alaska', region: US_REGIONS.WEST, majorCities: ['Anchorage', 'Fairbanks', 'Juneau'], isActive: true, weddingSeasonPeak: 'Summer', popularVenueTypes: ['Outdoor Venues', 'Unique Venues', 'Lodge Venues'] },
  { code: 'AZ', name: 'Arizona', slug: 'arizona', region: US_REGIONS.WEST, majorCities: ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'], isActive: true, weddingSeasonPeak: 'Winter/Spring', popularVenueTypes: ['Desert Venues', 'Resort Venues', 'Outdoor Venues'] },
  { code: 'CA', name: 'California', slug: 'california', region: US_REGIONS.WEST, majorCities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'], isActive: true, weddingSeasonPeak: 'Year-round', popularVenueTypes: ['Beach Venues', 'Vineyard Venues', 'Garden Venues'] },
  { code: 'CO', name: 'Colorado', slug: 'colorado', region: US_REGIONS.WEST, majorCities: ['Denver', 'Colorado Springs', 'Boulder', 'Fort Collins'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Outdoor Venues'] },
  { code: 'HI', name: 'Hawaii', slug: 'hawaii', region: US_REGIONS.WEST, majorCities: ['Honolulu', 'Hilo', 'Kailua'], isActive: true, weddingSeasonPeak: 'Year-round', popularVenueTypes: ['Beach Venues', 'Resort Venues', 'Garden Venues'] },
  { code: 'ID', name: 'Idaho', slug: 'idaho', region: US_REGIONS.WEST, majorCities: ['Boise', 'Idaho Falls', 'Pocatello'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Outdoor Venues', 'Rustic Barns', 'Mountain Venues'] },
  { code: 'MT', name: 'Montana', slug: 'montana', region: US_REGIONS.WEST, majorCities: ['Billings', 'Missoula', 'Helena'], isActive: true, weddingSeasonPeak: 'Summer', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Outdoor Venues'] },
  { code: 'NV', name: 'Nevada', slug: 'nevada', region: US_REGIONS.WEST, majorCities: ['Las Vegas', 'Reno', 'Carson City'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Resort Venues', 'Unique Venues', 'Desert Venues'] },
  { code: 'NM', name: 'New Mexico', slug: 'new-mexico', region: US_REGIONS.WEST, majorCities: ['Albuquerque', 'Santa Fe', 'Las Cruces'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Desert Venues', 'Historic Venues', 'Outdoor Venues'] },
  { code: 'OR', name: 'Oregon', slug: 'oregon', region: US_REGIONS.WEST, majorCities: ['Portland', 'Salem', 'Eugene'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Outdoor Venues', 'Vineyard Venues', 'Rustic Barns'] },
  { code: 'UT', name: 'Utah', slug: 'utah', region: US_REGIONS.WEST, majorCities: ['Salt Lake City', 'Provo', 'Ogden'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Mountain Venues', 'Outdoor Venues', 'Historic Venues'] },
  { code: 'WA', name: 'Washington', slug: 'washington', region: US_REGIONS.WEST, majorCities: ['Seattle', 'Spokane', 'Tacoma'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Outdoor Venues', 'Vineyard Venues', 'Waterfront Venues'] },
  { code: 'WY', name: 'Wyoming', slug: 'wyoming', region: US_REGIONS.WEST, majorCities: ['Cheyenne', 'Casper', 'Laramie'], isActive: true, weddingSeasonPeak: 'Summer', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Outdoor Venues'] },

  // Northeast
  { code: 'CT', name: 'Connecticut', slug: 'connecticut', region: US_REGIONS.NORTHEAST, majorCities: ['Hartford', 'New Haven', 'Stamford'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Waterfront Venues'] },
  { code: 'ME', name: 'Maine', slug: 'maine', region: US_REGIONS.NORTHEAST, majorCities: ['Portland', 'Augusta', 'Bangor'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Waterfront Venues', 'Rustic Barns', 'Historic Venues'] },
  { code: 'MA', name: 'Massachusetts', slug: 'massachusetts', region: US_REGIONS.NORTHEAST, majorCities: ['Boston', 'Worcester', 'Springfield'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Waterfront Venues', 'Garden Venues'] },
  { code: 'NH', name: 'New Hampshire', slug: 'new-hampshire', region: US_REGIONS.NORTHEAST, majorCities: ['Manchester', 'Concord', 'Nashua'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Historic Venues'] },
  { code: 'NJ', name: 'New Jersey', slug: 'new-jersey', region: US_REGIONS.NORTHEAST, majorCities: ['Newark', 'Jersey City', 'Trenton'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Beach Venues', 'Historic Venues', 'Garden Venues'] },
  { code: 'NY', name: 'New York', slug: 'new-york', region: US_REGIONS.NORTHEAST, majorCities: ['New York City', 'Buffalo', 'Albany', 'Rochester'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Vineyard Venues', 'Unique Venues'] },
  { code: 'PA', name: 'Pennsylvania', slug: 'pennsylvania', region: US_REGIONS.NORTHEAST, majorCities: ['Philadelphia', 'Pittsburgh', 'Harrisburg'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Rustic Barns', 'Garden Venues'] },
  { code: 'RI', name: 'Rhode Island', slug: 'rhode-island', region: US_REGIONS.NORTHEAST, majorCities: ['Providence', 'Warwick', 'Newport'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Waterfront Venues', 'Historic Venues', 'Beach Venues'] },
  { code: 'VT', name: 'Vermont', slug: 'vermont', region: US_REGIONS.NORTHEAST, majorCities: ['Burlington', 'Montpelier', 'Rutland'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Mountain Venues', 'Rustic Barns', 'Historic Venues'] },

  // Midwest
  { code: 'IL', name: 'Illinois', slug: 'illinois', region: US_REGIONS.MIDWEST, majorCities: ['Chicago', 'Springfield', 'Peoria', 'Rockford'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Urban Venues'] },
  { code: 'IN', name: 'Indiana', slug: 'indiana', region: US_REGIONS.MIDWEST, majorCities: ['Indianapolis', 'Fort Wayne', 'South Bend'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Rustic Barns', 'Historic Venues', 'Garden Venues'] },
  { code: 'IA', name: 'Iowa', slug: 'iowa', region: US_REGIONS.MIDWEST, majorCities: ['Des Moines', 'Cedar Rapids', 'Davenport'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Rustic Barns', 'Historic Venues', 'Outdoor Venues'] },
  { code: 'KS', name: 'Kansas', slug: 'kansas', region: US_REGIONS.MIDWEST, majorCities: ['Wichita', 'Kansas City', 'Topeka'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Rustic Barns', 'Outdoor Venues', 'Historic Venues'] },
  { code: 'MI', name: 'Michigan', slug: 'michigan', region: US_REGIONS.MIDWEST, majorCities: ['Detroit', 'Grand Rapids', 'Ann Arbor'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Waterfront Venues', 'Historic Venues', 'Rustic Barns'] },
  { code: 'MN', name: 'Minnesota', slug: 'minnesota', region: US_REGIONS.MIDWEST, majorCities: ['Minneapolis', 'Saint Paul', 'Rochester'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Waterfront Venues', 'Historic Venues', 'Outdoor Venues'] },
  { code: 'MO', name: 'Missouri', slug: 'missouri', region: US_REGIONS.MIDWEST, majorCities: ['Kansas City', 'St. Louis', 'Springfield'], isActive: true, weddingSeasonPeak: 'Spring/Fall', popularVenueTypes: ['Historic Venues', 'Rustic Barns', 'Garden Venues'] },
  { code: 'NE', name: 'Nebraska', slug: 'nebraska', region: US_REGIONS.MIDWEST, majorCities: ['Omaha', 'Lincoln', 'Grand Island'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Rustic Barns', 'Outdoor Venues', 'Historic Venues'] },
  { code: 'ND', name: 'North Dakota', slug: 'north-dakota', region: US_REGIONS.MIDWEST, majorCities: ['Fargo', 'Bismarck', 'Grand Forks'], isActive: true, weddingSeasonPeak: 'Summer', popularVenueTypes: ['Outdoor Venues', 'Rustic Barns', 'Historic Venues'] },
  { code: 'OH', name: 'Ohio', slug: 'ohio', region: US_REGIONS.MIDWEST, majorCities: ['Columbus', 'Cleveland', 'Cincinnati'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Historic Venues', 'Garden Venues', 'Rustic Barns'] },
  { code: 'SD', name: 'South Dakota', slug: 'south-dakota', region: US_REGIONS.MIDWEST, majorCities: ['Sioux Falls', 'Rapid City', 'Aberdeen'], isActive: true, weddingSeasonPeak: 'Summer', popularVenueTypes: ['Outdoor Venues', 'Rustic Barns', 'Historic Venues'] },
  { code: 'WI', name: 'Wisconsin', slug: 'wisconsin', region: US_REGIONS.MIDWEST, majorCities: ['Milwaukee', 'Madison', 'Green Bay'], isActive: true, weddingSeasonPeak: 'Summer/Fall', popularVenueTypes: ['Waterfront Venues', 'Rustic Barns', 'Historic Venues'] }
];

export const getStateBySlug = (slug: string): StateInfo | undefined => {
  return ALL_STATES.find(state => state.slug === slug);
};

export const getStatesByRegion = (region: string): StateInfo[] => {
  return ALL_STATES.filter(state => state.region === region);
};

export const getActiveStates = (): StateInfo[] => {
  return ALL_STATES.filter(state => state.isActive);
};

export const POPULAR_WEDDING_STATES = [
  'california', 'florida', 'texas', 'new-york', 'north-carolina',
  'colorado', 'hawaii', 'georgia', 'virginia', 'tennessee'
];

export const getPopularWeddingStates = (): StateInfo[] => {
  return ALL_STATES.filter(state => POPULAR_WEDDING_STATES.includes(state.slug));
};
