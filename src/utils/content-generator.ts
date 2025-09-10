import { slugToLabel, getSEOCategoryName } from './taxonomy';
import { SearchResult } from '@/types/search';

export interface CityMarketData {
  city: string;
  state: string;
  category: string;
  subcategory?: string;
  vendorCount: number;
  averageRating: number;
  popularStyles: Array<{ style: string; percentage: number }>;
  priceRange: string;
  bookingWindowMonths: string;
  topNeighborhoods: string[];
  seasonality: string;
  totalReviews: number;
}

export interface ContentGenerationOptions {
  includeStats: boolean;
  includeNeighborhoods: boolean;
  includePricing: boolean;
  includeSeasonality: boolean;
  wordCount: 'short' | 'medium' | 'long'; // 120-180 words for medium
}

/**
 * Fetch real market data for a city/category combination from vendor cache
 * This function will be enhanced with MCP integration for real-time data
 */
export const fetchCityMarketData = async (
  city: string, 
  state: string, 
  category: string, 
  subcategory?: string
): Promise<CityMarketData | null> => {
  try {
    // For now, we'll use a mock implementation that can be enhanced with MCP
    // In a real implementation, this would query the vendor_cache table or use Supabase MCP
    
    // Mock data based on typical market patterns
    const mockData = generateMockMarketData(city, state, category, subcategory);
    
    // TODO: Replace with actual MCP query when implemented
    // const vendors = await fetchVendorsViaMCP(city, state, category, subcategory);
    
    return mockData;

  } catch (error) {
    console.error('Error fetching city market data:', error);
    return null;
  }
};

/**
 * Generate mock market data for development and fallback
 * This will be replaced with real MCP queries
 */
const generateMockMarketData = (
  city: string,
  state: string,
  category: string,
  subcategory?: string
): CityMarketData => {
  // Generate realistic mock data based on city size and category
  const cityPopulationTiers = {
    'New York': 'major',
    'Los Angeles': 'major',
    'Chicago': 'major',
    'Houston': 'major',
    'Phoenix': 'major',
    'Philadelphia': 'major',
    'San Antonio': 'major',
    'San Diego': 'major',
    'Dallas': 'major',
    'San Jose': 'major',
    'Austin': 'large',
    'Jacksonville': 'large',
    'Fort Worth': 'large',
    'Columbus': 'large',
    'Charlotte': 'large',
    'San Francisco': 'large',
    'Indianapolis': 'large',
    'Seattle': 'large',
    'Denver': 'large',
    'Washington': 'large'
  };

  const tier = cityPopulationTiers[city as keyof typeof cityPopulationTiers] || 'medium';
  
  // Base vendor counts by tier and category
  const baseVendorCounts = {
    major: { photographers: 45, venues: 35, caterers: 30, florists: 25, djs: 40 },
    large: { photographers: 25, venues: 20, caterers: 18, florists: 15, djs: 22 },
    medium: { photographers: 12, venues: 10, caterers: 8, florists: 8, djs: 12 }
  };

  const vendorCount = baseVendorCounts[tier as keyof typeof baseVendorCounts]?.[category as keyof typeof baseVendorCounts.major] || 8;
  
  // Generate realistic ratings (4.2-4.8 range)
  const averageRating = Math.round((4.2 + Math.random() * 0.6) * 10) / 10;
  
  // Category-specific popular styles
  const categoryStyles = {
    photographers: ['Classic', 'Photojournalistic', 'Fine Art', 'Modern'],
    venues: ['Rustic', 'Modern', 'Historic', 'Garden'],
    caterers: ['Contemporary', 'Traditional', 'Farm-to-Table', 'International'],
    florists: ['Romantic', 'Modern', 'Rustic', 'Classic'],
    djs: ['Top 40', 'Classic Rock', 'Hip Hop', 'Electronic']
  };

  const styles = categoryStyles[category as keyof typeof categoryStyles] || ['Classic', 'Modern', 'Traditional'];
  const popularStyles = styles.slice(0, 3).map((style, index) => ({
    style,
    percentage: 35 - (index * 8) + Math.floor(Math.random() * 10)
  }));

  // Generate neighborhoods based on city
  const cityNeighborhoods = {
    'Dallas': ['Arts District', 'Deep Ellum', 'Bishop Arts District'],
    'Austin': ['South Austin', 'Downtown', 'East Austin'],
    'Houston': ['Heights', 'Montrose', 'River Oaks'],
    'San Antonio': ['Pearl District', 'Southtown', 'King William'],
    'New York': ['Manhattan', 'Brooklyn', 'Queens'],
    'Los Angeles': ['Beverly Hills', 'Santa Monica', 'Hollywood'],
    'Chicago': ['Lincoln Park', 'River North', 'Wicker Park']
  };

  const topNeighborhoods = cityNeighborhoods[city as keyof typeof cityNeighborhoods] || 
    [`${city} Downtown`, `${city} Historic District`, `${city} Arts District`];

  return {
    city,
    state,
    category,
    subcategory,
    vendorCount,
    averageRating,
    popularStyles,
    priceRange: '$$-$$$',
    bookingWindowMonths: getBookingWindow(category),
    topNeighborhoods: topNeighborhoods.slice(0, 2),
    seasonality: getSeasonality(state),
    totalReviews: vendorCount * 15 // Approximate reviews per vendor
  };
};

/**
 * Generate dynamic intro content based on real market data
 */
export const generateCityIntro = async (
  city: string,
  state: string,
  category: string,
  subcategory?: string,
  options: ContentGenerationOptions = {
    includeStats: true,
    includeNeighborhoods: true,
    includePricing: true,
    includeSeasonality: true,
    wordCount: 'medium'
  }
): Promise<string> => {
  const marketData = await fetchCityMarketData(city, state, category, subcategory);
  
  if (!marketData) {
    return generateFallbackIntro(city, state, category, subcategory);
  }

  const categoryLabel = getSEOCategoryName(category, subcategory);
  const stateAbbr = getStateAbbreviation(state);
  
  // Build intro paragraphs
  const introParts: string[] = [];

  // Opening statement with stats
  if (options.includeStats && marketData.vendorCount > 0) {
    const ratingText = marketData.averageRating > 0 
      ? ` with an average ${marketData.averageRating}★ rating`
      : '';
    
    introParts.push(
      `${city}'s wedding ${category.toLowerCase()} scene features ${marketData.vendorCount} professional${marketData.vendorCount === 1 ? '' : 's'}${ratingText}.`
    );
  }

  // Popular styles
  if (marketData.popularStyles.length > 0) {
    const stylesText = marketData.popularStyles
      .slice(0, 2)
      .map(s => `${s.style} (${s.percentage}%)`)
      .join(' and ');
    
    introParts.push(
      `Popular styles include ${stylesText}.`
    );
  }

  // Neighborhoods and pricing
  if (options.includeNeighborhoods && marketData.topNeighborhoods.length > 0) {
    const neighborhoodsText = marketData.topNeighborhoods.slice(0, 2).join(' and ');
    const pricingText = options.includePricing 
      ? ` with packages typically ranging ${marketData.priceRange}`
      : '';
    
    introParts.push(
      `Top areas like ${neighborhoodsText} see ${marketData.bookingWindowMonths} booking windows${pricingText}.`
    );
  }

  // Seasonality and booking advice
  if (options.includeSeasonality) {
    introParts.push(
      `${marketData.seasonality} Book early to secure your preferred ${category.toLowerCase()} for your ${city} wedding.`
    );
  }

  // Call to action
  introParts.push(
    `Browse our curated list of top-rated ${categoryLabel.toLowerCase()} in ${city}, ${stateAbbr} and connect with multiple vendors to find your perfect match.`
  );

  return introParts.join(' ');
};

/**
 * Generate city-specific FAQ content
 */
export const generateCityFAQs = async (
  city: string,
  state: string,
  category: string,
  subcategory?: string
): Promise<Array<{ question: string; answer: string }>> => {
  const marketData = await fetchCityMarketData(city, state, category, subcategory);
  const categoryLabel = getSEOCategoryName(category, subcategory);
  
  const faqs: Array<{ question: string; answer: string }> = [];

  // Pricing FAQ with real data
  if (marketData && marketData.vendorCount > 0) {
    faqs.push({
      question: `What's the typical price range for ${categoryLabel.toLowerCase()} in ${city}, ${state}?`,
      answer: `Based on our data from ${marketData.vendorCount} local ${category.toLowerCase()}, ${categoryLabel.toLowerCase()} in ${city} typically range ${marketData.priceRange}. Prices vary based on experience, package inclusions, and specific requirements. We recommend contacting multiple vendors for accurate quotes.`
    });
  }

  // Booking window FAQ
  faqs.push({
    question: `How far in advance should I book a ${categoryLabel.toLowerCase()} in ${city}, ${state}?`,
    answer: `For ${city} weddings, we recommend booking your ${categoryLabel.toLowerCase()} ${marketData?.bookingWindowMonths || '9-12 months'} in advance. ${marketData?.seasonality || 'Peak wedding season (May-October)'} dates book up fastest, so early planning is essential.`
  });

  // Popular styles FAQ
  if (marketData && marketData.popularStyles.length > 0) {
    const stylesText = marketData.popularStyles
      .map(s => s.style)
      .slice(0, 3)
      .join(', ');
    
    faqs.push({
      question: `What styles are popular for ${categoryLabel.toLowerCase()} in ${city}?`,
      answer: `The most popular ${category.toLowerCase()} styles in ${city} include ${stylesText}. Local couples often choose styles that complement ${city}'s unique venues and aesthetic. Browse our vendor portfolios to see examples of each style.`
    });
  }

  // Neighborhood/area FAQ
  if (marketData && marketData.topNeighborhoods.length > 0) {
    const areasText = marketData.topNeighborhoods.slice(0, 2).join(' and ');
    faqs.push({
      question: `Which areas of ${city} have the best ${categoryLabel.toLowerCase()}?`,
      answer: `${areasText} are popular areas for ${categoryLabel.toLowerCase()} in ${city}. However, most professional ${category.toLowerCase()} serve the entire ${city} metropolitan area. Consider factors like travel time to your venue when making your selection.`
    });
  }

  // Reviews and selection FAQ
  if (marketData && marketData.averageRating > 0) {
    faqs.push({
      question: `How do I choose the best ${categoryLabel.toLowerCase()} in ${city}, ${state}?`,
      answer: `With an average rating of ${marketData.averageRating}★ among ${city} ${category.toLowerCase()}, quality is generally high. Focus on portfolio style, personality fit, availability for your date, and package inclusions. Read recent reviews and schedule consultations with your top 3 choices.`
    });
  }

  return faqs.slice(0, 5); // Limit to 5 FAQs as specified in the brief
};

/**
 * Generate fallback intro for cities without sufficient data
 */
const generateFallbackIntro = (
  city: string,
  state: string,
  category: string,
  subcategory?: string
): string => {
  const categoryLabel = getSEOCategoryName(category, subcategory);
  const stateAbbr = getStateAbbreviation(state);
  const bookingWindow = getBookingWindow(category);
  const seasonality = getSeasonality(state);
  
  return `Finding the perfect ${categoryLabel.toLowerCase()} for your ${city} wedding is an important decision that sets the tone for your special day. ${city}, ${state} offers a diverse selection of talented ${category.toLowerCase()} who understand the local wedding scene and can capture your unique style. ${seasonality} Most couples book their ${category.toLowerCase()} ${bookingWindow} in advance to ensure availability. Browse our carefully curated list of top-rated ${categoryLabel.toLowerCase()} in ${city}, ${stateAbbr} and connect with multiple vendors to find the perfect match for your wedding vision and budget.`;
};

/**
 * Get typical booking window for category
 */
const getBookingWindow = (category: string): string => {
  const bookingWindows: { [key: string]: string } = {
    'photographers': '10-14 months',
    'videographers': '10-12 months',
    'venues': '12-18 months',
    'caterers': '8-12 months',
    'florists': '6-9 months',
    'djs': '6-10 months',
    'bands': '8-12 months',
    'planners': '12-15 months',
    'makeup-artists': '6-9 months',
    'hair-stylists': '6-9 months'
  };
  
  return bookingWindows[category] || '9-12 months';
};

/**
 * Get seasonality information for state
 */
const getSeasonality = (state: string): string => {
  const seasonality: { [key: string]: string } = {
    'Texas': 'Spring and fall are peak wedding seasons in Texas.',
    'California': 'Year-round wedding season with peak demand in spring and fall.',
    'Florida': 'Winter and spring are most popular for Florida weddings.',
    'New York': 'Late spring through early fall is peak wedding season.',
    'Illinois': 'Summer and early fall are the most popular wedding months.',
    'Pennsylvania': 'Late spring through early fall sees the highest demand.',
    'Ohio': 'Summer months are peak wedding season in Ohio.',
    'Georgia': 'Spring and fall offer the best weather for Georgia weddings.',
    'North Carolina': 'Spring and fall are ideal for North Carolina weddings.',
    'Michigan': 'Summer and early fall are peak wedding seasons.'
  };
  
  return seasonality[state] || 'Peak wedding season typically runs from May through October.';
};

/**
 * Get state abbreviation
 */
const getStateAbbreviation = (state: string): string => {
  const stateAbbreviations: { [key: string]: string } = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC'
  };
  
  return stateAbbreviations[state] || state.toUpperCase().slice(0, 2);
};

/**
 * Word bank for content variation to prevent duplication
 */
export const contentVariations = {
  openingWords: [
    'features', 'offers', 'boasts', 'showcases', 'presents', 'includes'
  ],
  qualityWords: [
    'professional', 'talented', 'experienced', 'skilled', 'expert', 'top-rated'
  ],
  locationWords: [
    'scene', 'market', 'community', 'landscape', 'selection', 'options'
  ],
  actionWords: [
    'browse', 'explore', 'discover', 'view', 'check out', 'review'
  ]
};

/**
 * Get random variation to prevent duplicate content
 */
export const getRandomVariation = (variations: string[]): string => {
  return variations[Math.floor(Math.random() * variations.length)];
};
