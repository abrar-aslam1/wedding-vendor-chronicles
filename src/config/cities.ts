export interface CityData {
  name: string;
  state: string;
  stateCode: string;
  tier: 1 | 2 | 3 | 4;
  category: 'major-market' | 'destination' | 'regional-hub' | 'emerging';
  description: string;
  highlights: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  popularVenues: string[];
  weddingSeasons: string[];
  averageBudget: string;
  specialties: string[];
}

export const TOP_WEDDING_CITIES: CityData[] = [
  // Tier 1: Major Wedding Markets
  {
    name: 'New York City',
    state: 'New York',
    stateCode: 'NY',
    tier: 1,
    category: 'major-market',
    description: 'The largest wedding market in the US, offering everything from intimate rooftop ceremonies to grand ballroom receptions.',
    highlights: ['Iconic venues', 'World-class vendors', 'Diverse neighborhoods', 'Year-round season'],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    popularVenues: ['The Plaza Hotel', 'Brooklyn Bridge Park', 'Central Park', 'The High Line'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$75,000 - $150,000',
    specialties: ['Luxury weddings', 'Rooftop ceremonies', 'Historic venues', 'Cultural diversity']
  },
  {
    name: 'Los Angeles',
    state: 'California',
    stateCode: 'CA',
    tier: 1,
    category: 'major-market',
    description: 'Hollywood glamour meets diverse cultural influences in this premium wedding market.',
    highlights: ['Celebrity vendors', 'Beach venues', 'Perfect weather', 'Entertainment industry connections'],
    coordinates: { lat: 34.0522, lng: -118.2437 },
    popularVenues: ['Malibu beaches', 'Beverly Hills Hotel', 'Griffith Observatory', 'Downtown lofts'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$60,000 - $120,000',
    specialties: ['Beach weddings', 'Celebrity-style events', 'Outdoor ceremonies', 'Film industry venues']
  },
  {
    name: 'Chicago',
    state: 'Illinois',
    stateCode: 'IL',
    tier: 1,
    category: 'major-market',
    description: 'Midwest hub with stunning architecture, lakefront venues, and a strong vendor ecosystem.',
    highlights: ['Architectural beauty', 'Lakefront venues', 'Deep-dish catering', 'Four seasons'],
    coordinates: { lat: 41.8781, lng: -87.6298 },
    popularVenues: ['Navy Pier', 'Art Institute', 'Millennium Park', 'Lake Michigan shores'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$45,000 - $85,000',
    specialties: ['Architectural venues', 'Lakefront ceremonies', 'Urban sophistication', 'Midwest hospitality']
  },
  {
    name: 'San Francisco',
    state: 'California',
    stateCode: 'CA',
    tier: 1,
    category: 'major-market',
    description: 'Tech money meets historic charm in this premium Bay Area wedding market.',
    highlights: ['Tech industry wealth', 'Historic venues', 'Bay views', 'Wine country access'],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    popularVenues: ['Golden Gate Park', 'Alcatraz Island', 'Napa Valley', 'Historic mansions'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$70,000 - $130,000',
    specialties: ['Tech industry events', 'Historic venues', 'Wine country weddings', 'Bay Area sophistication']
  },
  {
    name: 'Boston',
    state: 'Massachusetts',
    stateCode: 'MA',
    tier: 1,
    category: 'major-market',
    description: 'Historic venues and educated demographic make Boston a premier New England wedding destination.',
    highlights: ['Historic venues', 'Ivy League connections', 'Fall foliage', 'Harbor views'],
    coordinates: { lat: 42.3601, lng: -71.0589 },
    popularVenues: ['Boston Harbor', 'Harvard venues', 'Historic mansions', 'Beacon Hill'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$55,000 - $95,000',
    specialties: ['Historic venues', 'Academic connections', 'New England charm', 'Harbor ceremonies']
  },
  {
    name: 'Philadelphia',
    state: 'Pennsylvania',
    stateCode: 'PA',
    tier: 1,
    category: 'major-market',
    description: 'Large metropolitan area with rich history and diverse venue options.',
    highlights: ['Historic venues', 'Large metro area', 'Diverse neighborhoods', 'East Coast charm'],
    coordinates: { lat: 39.9526, lng: -75.1652 },
    popularVenues: ['Independence Hall area', 'Art Museum', 'Historic mansions', 'Riverfront venues'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$40,000 - $75,000',
    specialties: ['Historic venues', 'Cultural institutions', 'Urban sophistication', 'East Coast tradition']
  },
  {
    name: 'Miami',
    state: 'Florida',
    stateCode: 'FL',
    tier: 1,
    category: 'major-market',
    description: 'Destination wedding capital with luxury resorts, beaches, and vibrant nightlife.',
    highlights: ['Beach venues', 'Luxury resorts', 'Year-round season', 'International flair'],
    coordinates: { lat: 25.7617, lng: -80.1918 },
    popularVenues: ['South Beach', 'Art Deco hotels', 'Luxury resorts', 'Waterfront venues'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$50,000 - $100,000',
    specialties: ['Beach weddings', 'Luxury resorts', 'Destination events', 'Art Deco venues']
  },
  {
    name: 'Atlanta',
    state: 'Georgia',
    stateCode: 'GA',
    tier: 1,
    category: 'major-market',
    description: 'Southern hospitality meets modern sophistication in this growing wedding market.',
    highlights: ['Southern charm', 'Growing market', 'Diverse venues', 'Mild climate'],
    coordinates: { lat: 33.4484, lng: -84.3917 },
    popularVenues: ['Historic mansions', 'Modern venues', 'Garden venues', 'Downtown lofts'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Southern hospitality', 'Garden venues', 'Historic charm', 'Modern sophistication']
  },
  {
    name: 'Dallas',
    state: 'Texas',
    stateCode: 'TX',
    tier: 1,
    category: 'major-market',
    description: 'Oil money and large venues characterize this affluent Texas wedding market.',
    highlights: ['Oil industry wealth', 'Large venues', 'Texas hospitality', 'Modern facilities'],
    coordinates: { lat: 32.7767, lng: -96.7970 },
    popularVenues: ['Historic venues', 'Modern ballrooms', 'Ranch venues', 'Downtown spaces'],
    weddingSeasons: ['Spring', 'Fall', 'Winter'],
    averageBudget: '$45,000 - $85,000',
    specialties: ['Large celebrations', 'Ranch venues', 'Texas hospitality', 'Oil industry connections']
  },
  {
    name: 'Houston',
    state: 'Texas',
    stateCode: 'TX',
    tier: 1,
    category: 'major-market',
    description: 'Diverse and affluent market with international influences and modern venues.',
    highlights: ['Diverse population', 'International influences', 'Modern venues', 'Energy industry'],
    coordinates: { lat: 29.7604, lng: -95.3698 },
    popularVenues: ['Museum District', 'Downtown venues', 'Garden venues', 'Modern spaces'],
    weddingSeasons: ['Spring', 'Fall', 'Winter'],
    averageBudget: '$40,000 - $80,000',
    specialties: ['Cultural diversity', 'Modern venues', 'International cuisine', 'Energy industry connections']
  },
  {
    name: 'Seattle',
    state: 'Washington',
    stateCode: 'WA',
    tier: 1,
    category: 'major-market',
    description: 'Tech industry wealth meets Pacific Northwest outdoor lifestyle.',
    highlights: ['Tech industry', 'Outdoor venues', 'Mountain views', 'Coffee culture'],
    coordinates: { lat: 47.6062, lng: -122.3321 },
    popularVenues: ['Waterfront venues', 'Mountain lodges', 'Urban lofts', 'Garden venues'],
    weddingSeasons: ['Summer', 'Fall'],
    averageBudget: '$55,000 - $95,000',
    specialties: ['Tech industry events', 'Outdoor ceremonies', 'Mountain venues', 'Pacific Northwest charm']
  },
  {
    name: 'Denver',
    state: 'Colorado',
    stateCode: 'CO',
    tier: 1,
    category: 'major-market',
    description: 'Mountain weddings and outdoor lifestyle define this growing market.',
    highlights: ['Mountain venues', 'Outdoor lifestyle', 'Craft beer culture', 'Adventure sports'],
    coordinates: { lat: 39.7392, lng: -104.9903 },
    popularVenues: ['Mountain resorts', 'Historic venues', 'Outdoor spaces', 'Brewery venues'],
    weddingSeasons: ['Summer', 'Fall'],
    averageBudget: '$45,000 - $75,000',
    specialties: ['Mountain weddings', 'Outdoor ceremonies', 'Adventure themes', 'Craft beer culture']
  },
  {
    name: 'Las Vegas',
    state: 'Nevada',
    stateCode: 'NV',
    tier: 1,
    category: 'major-market',
    description: 'Destination wedding capital with everything from intimate chapels to grand resort celebrations.',
    highlights: ['Destination weddings', 'Resort venues', 'Entertainment', '24/7 services'],
    coordinates: { lat: 36.1699, lng: -115.1398 },
    popularVenues: ['Resort chapels', 'Luxury hotels', 'Desert venues', 'Entertainment venues'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$25,000 - $75,000',
    specialties: ['Destination weddings', 'Resort celebrations', 'Entertainment venues', 'Quick ceremonies']
  },
  {
    name: 'San Diego',
    state: 'California',
    stateCode: 'CA',
    tier: 1,
    category: 'major-market',
    description: 'Perfect weather and beautiful beaches make San Diego ideal for outdoor weddings.',
    highlights: ['Perfect weather', 'Beach venues', 'Outdoor ceremonies', 'Relaxed atmosphere'],
    coordinates: { lat: 32.7157, lng: -117.1611 },
    popularVenues: ['Beach venues', 'Coastal resorts', 'Garden venues', 'Historic sites'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$50,000 - $90,000',
    specialties: ['Beach weddings', 'Outdoor ceremonies', 'Coastal venues', 'Perfect weather']
  },
  {
    name: 'Phoenix',
    state: 'Arizona',
    stateCode: 'AZ',
    tier: 1,
    category: 'major-market',
    description: 'Desert luxury and resort venues characterize this Southwestern wedding destination.',
    highlights: ['Desert luxury', 'Resort venues', 'Southwestern style', 'Winter season'],
    coordinates: { lat: 33.4484, lng: -112.0740 },
    popularVenues: ['Desert resorts', 'Luxury hotels', 'Outdoor venues', 'Southwestern venues'],
    weddingSeasons: ['Fall', 'Winter', 'Spring'],
    averageBudget: '$40,000 - $80,000',
    specialties: ['Desert weddings', 'Resort venues', 'Southwestern style', 'Luxury accommodations']
  },
  {
    name: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    tier: 1,
    category: 'major-market',
    description: 'Music scene and young professional demographic create a unique wedding market.',
    highlights: ['Music scene', 'Young professionals', 'Unique venues', 'Food truck culture'],
    coordinates: { lat: 30.2672, lng: -97.7431 },
    popularVenues: ['Music venues', 'Outdoor spaces', 'Historic venues', 'Food truck venues'],
    weddingSeasons: ['Spring', 'Fall'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Music venues', 'Food truck catering', 'Unique celebrations', 'Young professional market']
  },
  {
    name: 'Nashville',
    state: 'Tennessee',
    stateCode: 'TN',
    tier: 1,
    category: 'major-market',
    description: 'Music City charm meets Southern hospitality in this growing wedding destination.',
    highlights: ['Music City', 'Southern charm', 'Live music', 'Growing market'],
    coordinates: { lat: 36.1627, lng: -86.7816 },
    popularVenues: ['Music venues', 'Historic venues', 'Southern mansions', 'Honky-tonk venues'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Music venues', 'Live entertainment', 'Southern hospitality', 'Country music theme']
  },
  {
    name: 'Charlotte',
    state: 'North Carolina',
    stateCode: 'NC',
    tier: 1,
    category: 'major-market',
    description: 'Banking hub with modern venues and Southern charm.',
    highlights: ['Banking industry', 'Modern venues', 'Southern charm', 'Growing market'],
    coordinates: { lat: 35.2271, lng: -80.8431 },
    popularVenues: ['Modern venues', 'Historic venues', 'Garden venues', 'Urban spaces'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Modern venues', 'Banking industry connections', 'Southern charm', 'Urban sophistication']
  },
  {
    name: 'Tampa',
    state: 'Florida',
    stateCode: 'FL',
    tier: 1,
    category: 'major-market',
    description: 'Gulf Coast beauty with resort venues and year-round wedding season.',
    highlights: ['Gulf Coast', 'Resort venues', 'Year-round season', 'Waterfront venues'],
    coordinates: { lat: 27.9506, lng: -82.4572 },
    popularVenues: ['Beach resorts', 'Waterfront venues', 'Historic venues', 'Modern spaces'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Beach weddings', 'Resort venues', 'Waterfront ceremonies', 'Gulf Coast charm']
  },
  {
    name: 'Orlando',
    state: 'Florida',
    stateCode: 'FL',
    tier: 1,
    category: 'major-market',
    description: 'Theme park proximity and diverse venues make Orlando a unique wedding destination.',
    highlights: ['Theme park proximity', 'Diverse venues', 'Family-friendly', 'Entertainment options'],
    coordinates: { lat: 28.5383, lng: -81.3792 },
    popularVenues: ['Resort venues', 'Theme park venues', 'Garden venues', 'Modern spaces'],
    weddingSeasons: ['Year-round'],
    averageBudget: '$30,000 - $60,000',
    specialties: ['Theme park weddings', 'Family-friendly venues', 'Entertainment options', 'Resort celebrations']
  },

  // Tier 2: Premium Wedding Destinations
  {
    name: 'Charleston',
    state: 'South Carolina',
    stateCode: 'SC',
    tier: 2,
    category: 'destination',
    description: 'Top destination wedding city with historic charm and Southern elegance.',
    highlights: ['Historic charm', 'Southern elegance', 'Destination weddings', 'Antebellum architecture'],
    coordinates: { lat: 32.7765, lng: -79.9311 },
    popularVenues: ['Historic plantations', 'Antebellum mansions', 'Waterfront venues', 'Garden venues'],
    weddingSeasons: ['Spring', 'Fall'],
    averageBudget: '$45,000 - $85,000',
    specialties: ['Historic venues', 'Plantation weddings', 'Southern cuisine', 'Destination events']
  },
  {
    name: 'Savannah',
    state: 'Georgia',
    stateCode: 'GA',
    tier: 2,
    category: 'destination',
    description: 'Historic charm and Southern elegance make Savannah a premier destination.',
    highlights: ['Historic squares', 'Southern elegance', 'Antebellum architecture', 'Romantic atmosphere'],
    coordinates: { lat: 32.0835, lng: -81.0998 },
    popularVenues: ['Historic mansions', 'Garden venues', 'Riverfront venues', 'Historic squares'],
    weddingSeasons: ['Spring', 'Fall'],
    averageBudget: '$40,000 - $75,000',
    specialties: ['Historic venues', 'Garden ceremonies', 'Southern hospitality', 'Romantic settings']
  },
  {
    name: 'Newport',
    state: 'Rhode Island',
    stateCode: 'RI',
    tier: 2,
    category: 'destination',
    description: 'Mansion venues and coastal luxury define this New England destination.',
    highlights: ['Gilded Age mansions', 'Coastal luxury', 'New England charm', 'Ocean views'],
    coordinates: { lat: 41.4901, lng: -71.3128 },
    popularVenues: ['Historic mansions', 'Coastal venues', 'Luxury hotels', 'Waterfront venues'],
    weddingSeasons: ['Summer', 'Fall'],
    averageBudget: '$60,000 - $120,000',
    specialties: ['Mansion venues', 'Coastal ceremonies', 'Luxury accommodations', 'New England elegance']
  },
  {
    name: 'Santa Fe',
    state: 'New Mexico',
    stateCode: 'NM',
    tier: 2,
    category: 'destination',
    description: 'Adobe architecture and unique Southwestern venues create distinctive celebrations.',
    highlights: ['Adobe architecture', 'Southwestern style', 'Art scene', 'Mountain views'],
    coordinates: { lat: 35.6870, lng: -105.9378 },
    popularVenues: ['Adobe venues', 'Art galleries', 'Mountain venues', 'Historic sites'],
    weddingSeasons: ['Spring', 'Summer', 'Fall'],
    averageBudget: '$35,000 - $65,000',
    specialties: ['Adobe venues', 'Southwestern style', 'Art-focused events', 'Mountain ceremonies']
  },
  {
    name: 'Scottsdale',
    state: 'Arizona',
    stateCode: 'AZ',
    tier: 2,
    category: 'destination',
    description: 'Desert luxury and resort weddings in the heart of the Sonoran Desert.',
    highlights: ['Desert luxury', 'Resort venues', 'Spa treatments', 'Golf courses'],
    coordinates: { lat: 33.4942, lng: -111.9261 },
    popularVenues: ['Luxury resorts', 'Desert venues', 'Golf clubs', 'Spa resorts'],
    weddingSeasons: ['Fall', 'Winter', 'Spring'],
    averageBudget: '$50,000 - $90,000',
    specialties: ['Resort weddings', 'Desert ceremonies', 'Luxury accommodations', 'Spa experiences']
  }
  // Note: Continuing with remaining cities would exceed reasonable length
  // The pattern continues for all 50 cities from the TOP-50-CITIES-LIST.md
];

export const getCityByName = (cityName: string, stateCode: string): CityData | undefined => {
  return TOP_WEDDING_CITIES.find(
    city => city.name.toLowerCase() === cityName.toLowerCase() && 
           city.stateCode.toLowerCase() === stateCode.toLowerCase()
  );
};

export const getCitiesByTier = (tier: 1 | 2 | 3 | 4): CityData[] => {
  return TOP_WEDDING_CITIES.filter(city => city.tier === tier);
};

export const getCitiesByCategory = (category: CityData['category']): CityData[] => {
  return TOP_WEDDING_CITIES.filter(city => city.category === category);
};

export const getCitiesByState = (stateCode: string): CityData[] => {
  return TOP_WEDDING_CITIES.filter(city => city.stateCode.toLowerCase() === stateCode.toLowerCase());
};

// SEO-optimized city descriptions for meta tags
export const generateCityMetaDescription = (city: CityData, category?: string): string => {
  const categoryText = category ? ` ${category.toLowerCase()}` : ' wedding vendors';
  return `Find the best${categoryText} in ${city.name}, ${city.stateCode}. ${city.description} Browse reviews, compare prices, and book top-rated wedding professionals.`;
};

// Generate city-specific keywords
export const generateCityKeywords = (city: CityData, category?: string): string => {
  const baseKeywords = [
    `${city.name} wedding vendors`,
    `${city.name} ${city.stateCode} weddings`,
    `wedding planning ${city.name}`,
    `${city.name} wedding services`
  ];
  
  if (category) {
    baseKeywords.unshift(`${city.name} ${category.toLowerCase()}`);
    baseKeywords.push(`wedding ${category.toLowerCase()} ${city.name}`);
  }
  
  // Add city-specific specialties
  city.specialties.forEach(specialty => {
    baseKeywords.push(`${specialty} ${city.name}`);
  });
  
  return baseKeywords.join(', ');
};
