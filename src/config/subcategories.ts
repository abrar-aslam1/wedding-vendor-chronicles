// Enhanced subcategories for each vendor category with city-specific specializations
import { TOP_WEDDING_CITIES, type CityData } from './cities';

export interface CitySpecialization {
  description: string;
  highlights: string[];
  avgPricing?: string;
  seasonality?: string;
}

export interface SubcategoryData {
  id: string;
  name: string;
  description: string;
  citySpecializations?: {
    [cityName: string]: CitySpecialization;
  };
  citySpecialization?: CitySpecialization;
}

export const subcategories: Record<string, SubcategoryData[]> = {
  'caterers': [
    { 
      id: '1', 
      name: 'American', 
      description: 'American cuisine with burgers, steaks, and comfort food',
      citySpecializations: {
        'New York City': {
          description: 'NYC American cuisine featuring gourmet burgers, farm-to-table steaks, and elevated comfort food',
          highlights: ['Gourmet food trucks', 'High-end steakhouses', 'Rooftop BBQ stations'],
          avgPricing: '$85-150 per person',
          seasonality: 'Year-round'
        },
        'Austin': {
          description: 'Texas-style American BBQ and comfort food with local flair',
          highlights: ['Authentic BBQ', 'Food truck catering', 'Live music venues'],
          avgPricing: '$45-75 per person',
          seasonality: 'Peak in Spring/Fall'
        },
        'Charleston': {
          description: 'Southern American cuisine with coastal influences and comfort classics',
          highlights: ['Lowcountry boil', 'Shrimp and grits', 'Southern hospitality'],
          avgPricing: '$55-85 per person',
          seasonality: 'Spring/Fall preferred'
        }
      }
    },
    { 
      id: '2', 
      name: 'Italian', 
      description: 'Italian cuisine featuring pasta, pizza, and more',
      citySpecializations: {
        'New York City': {
          description: 'Authentic Italian cuisine from Little Italy establishments and modern interpretations',
          highlights: ['Wood-fired pizza', 'Fresh pasta stations', 'Authentic famiglia recipes'],
          avgPricing: '$75-120 per person',
          seasonality: 'Year-round'
        },
        'San Francisco': {
          description: 'Northern California Italian with wine country influences and fresh ingredients',
          highlights: ['Wine pairings', 'Farm-fresh ingredients', 'Rustic Italian charm'],
          avgPricing: '$85-140 per person',
          seasonality: 'Spring/Summer/Fall'
        },
        'Boston': {
          description: 'North End Italian traditions with modern culinary techniques',
          highlights: ['Traditional recipes', 'Fresh seafood pasta', 'Italian family-style service'],
          avgPricing: '$70-110 per person',
          seasonality: 'Spring/Summer/Fall'
        }
      }
    },
    { 
      id: '3', 
      name: 'Mexican', 
      description: 'Mexican cuisine with tacos, enchiladas, and traditional dishes',
      citySpecializations: {
        'Los Angeles': {
          description: 'Authentic Mexican cuisine with regional specialties and modern interpretations',
          highlights: ['Taco bars', 'Authentic regional dishes', 'Mezcal and tequila bars'],
          avgPricing: '$50-85 per person',
          seasonality: 'Year-round'
        },
        'Austin': {
          description: 'Tex-Mex fusion with authentic Mexican influences and local ingredients',
          highlights: ['Breakfast tacos', 'Barbacoa', 'Local Austin flair'],
          avgPricing: '$40-70 per person',
          seasonality: 'Peak in Spring/Fall'
        },
        'Miami': {
          description: 'Mexican cuisine with Caribbean and South American influences',
          highlights: ['Tropical fusion', 'Ceviche stations', 'Colorful presentations'],
          avgPricing: '$55-90 per person',
          seasonality: 'Year-round'
        }
      }
    },
    { id: '4', name: 'Indian', description: 'Indian cuisine with curry, tandoori, and diverse regional dishes' },
    { id: '5', name: 'Chinese', description: 'Chinese cuisine with stir-fry, dim sum, and regional specialties' },
    { id: '6', name: 'Mediterranean', description: 'Mediterranean cuisine featuring healthy dishes from Greece, Turkey, and more' },
    { id: '7', name: 'Japanese', description: 'Japanese cuisine with sushi, ramen, and traditional dishes' },
    { id: '8', name: 'Thai', description: 'Thai cuisine with flavorful curries, noodles, and aromatic dishes' },
    { id: '9', name: 'French', description: 'French cuisine with elegant dishes, pastries, and culinary traditions' },
    { id: '10', name: 'Spanish', description: 'Spanish cuisine featuring paella, tapas, and regional specialties' },
    { id: '11', name: 'Middle Eastern', description: 'Middle Eastern cuisine with falafel, hummus, and traditional dishes' }
  ],
  'wedding-planners': [
    { 
      id: '1', 
      name: 'Full-Service Planning', 
      description: 'Comprehensive planning services from engagement to wedding day',
      citySpecializations: {
        'New York City': {
          description: 'Full-service NYC wedding planning with venue sourcing, vendor coordination, and logistics expertise',
          highlights: ['Premium venue access', 'Celebrity vendor network', 'Logistics coordination'],
          avgPricing: '$8,000-25,000',
          seasonality: 'Year-round bookings'
        },
        'Los Angeles': {
          description: 'Hollywood-style full-service planning with entertainment industry connections',
          highlights: ['Celebrity connections', 'Beach ceremony expertise', 'Entertainment coordination'],
          avgPricing: '$6,000-20,000',
          seasonality: 'Year-round preferred'
        },
        'Charleston': {
          description: 'Southern elegance full-service planning specializing in historic venue coordination',
          highlights: ['Historic venue expertise', 'Southern hospitality', 'Plantation weddings'],
          avgPricing: '$5,000-15,000',
          seasonality: 'Spring/Fall peak'
        }
      }
    },
    { 
      id: '2', 
      name: 'Day-of Coordination', 
      description: 'Professional coordination services for just the wedding day',
      citySpecializations: {
        'Chicago': {
          description: 'Expert day-of coordination for Chicago venues with weather contingency planning',
          highlights: ['Weather backup plans', 'Vendor timeline management', 'Lakefront logistics'],
          avgPricing: '$1,500-3,500',
          seasonality: 'Summer/Fall peak'
        },
        'Miami': {
          description: 'Beach and resort day-of coordination with tropical weather expertise',
          highlights: ['Beach ceremony logistics', 'Weather contingencies', 'Resort coordination'],
          avgPricing: '$1,800-4,000',
          seasonality: 'Year-round'
        }
      }
    },
    { id: '3', name: 'Partial Planning', description: 'Planning assistance for specific aspects of your wedding' },
    { 
      id: '4', 
      name: 'Destination Wedding Planning', 
      description: 'Specialized planning for weddings away from your home location',
      citySpecializations: {
        'Las Vegas': {
          description: 'Vegas destination wedding specialists with chapel and resort expertise',
          highlights: ['Chapel coordination', 'Resort planning', 'Entertainment booking'],
          avgPricing: '$2,500-8,000',
          seasonality: 'Year-round'
        },
        'Hawaii': {
          description: 'Tropical destination wedding planning with beach ceremony expertise',
          highlights: ['Beach permits', 'Island vendor network', 'Cultural ceremonies'],
          avgPricing: '$4,000-12,000',
          seasonality: 'Year-round peak'
        },
        'Napa Valley': {
          description: 'Wine country destination planning with vineyard and winery coordination',
          highlights: ['Vineyard venues', 'Wine pairings', 'Harvest season events'],
          avgPricing: '$5,000-18,000',
          seasonality: 'Spring/Fall preferred'
        }
      }
    },
    { id: '5', name: 'Cultural Wedding Specialists', description: 'Planners with expertise in specific cultural wedding traditions' }
  ],
  'photographers': [
    { 
      id: '1', 
      name: 'Traditional Photography', 
      description: 'Classic posed wedding photography with formal portraits',
      citySpecializations: {
        'Boston': {
          description: 'Traditional New England wedding photography with historic venue expertise',
          highlights: ['Historic venue lighting', 'Ivy League backgrounds', 'Formal portraiture'],
          avgPricing: '$3,500-8,000',
          seasonality: 'Fall foliage season premium'
        },
        'Charleston': {
          description: 'Southern traditional photography specializing in plantation and historic venues',
          highlights: ['Plantation settings', 'Antebellum architecture', 'Golden hour portraits'],
          avgPricing: '$2,800-6,500',
          seasonality: 'Spring/Fall preferred'
        }
      }
    },
    { 
      id: '2', 
      name: 'Photojournalistic', 
      description: 'Candid, storytelling approach to wedding photography',
      citySpecializations: {
        'New York City': {
          description: 'Urban photojournalistic style capturing NYC energy and authentic moments',
          highlights: ['Street photography style', 'Urban backdrops', 'Candid storytelling'],
          avgPricing: '$4,500-12,000',
          seasonality: 'Year-round'
        },
        'San Francisco': {
          description: 'Bay Area photojournalism with tech industry and artistic influences',
          highlights: ['Golden Gate backdrops', 'Diverse neighborhoods', 'Natural lighting'],
          avgPricing: '$4,000-10,000',
          seasonality: 'Spring/Summer/Fall'
        }
      }
    },
    { 
      id: '3', 
      name: 'Fine Art', 
      description: 'Artistic, editorial-style wedding photography',
      citySpecializations: {
        'Los Angeles': {
          description: 'Hollywood-inspired fine art photography with cinematic quality',
          highlights: ['Cinematic style', 'Editorial fashion influence', 'Perfect lighting'],
          avgPricing: '$5,000-15,000',
          seasonality: 'Year-round'
        },
        'Miami': {
          description: 'Art Deco and tropical fine art photography with vibrant colors',
          highlights: ['Art Deco backgrounds', 'Tropical colors', 'Beach fine art'],
          avgPricing: '$3,500-9,000',
          seasonality: 'Year-round'
        }
      }
    },
    { id: '4', name: 'Aerial Photography', description: 'Drone and elevated photography for unique perspectives' },
    { id: '5', name: 'Engagement Specialists', description: 'Photographers specializing in engagement and pre-wedding sessions' }
  ],
  'florists': [
    { id: '1', name: 'Modern Arrangements', description: 'Contemporary floral designs with clean lines and unique elements' },
    { id: '2', name: 'Classic/Traditional', description: 'Timeless floral arrangements with traditional wedding flowers' },
    { id: '3', name: 'Rustic/Bohemian', description: 'Natural, wildflower-inspired arrangements with organic elements' },
    { id: '4', name: 'Minimalist', description: 'Simple, elegant floral designs with a focus on negative space' },
    { id: '5', name: 'Luxury/Extravagant', description: 'Opulent floral installations and high-end arrangements' }
  ],
  'venues': [
    { 
      id: '1', 
      name: 'Ballrooms', 
      description: 'Elegant indoor spaces for traditional wedding receptions',
      citySpecializations: {
        'New York City': {
          description: 'Luxury NYC ballrooms in prestigious hotels and event spaces',
          highlights: ['Plaza Hotel', 'Rainbow Room', 'Metropolitan venues'],
          avgPricing: '$200-500 per person',
          seasonality: 'Year-round with premium rates'
        },
        'Chicago': {
          description: 'Grand ballrooms with architectural charm and lakefront views',
          highlights: ['Art Institute venues', 'Historic architecture', 'Lake Michigan views'],
          avgPricing: '$120-280 per person',
          seasonality: 'Spring/Summer/Fall preferred'
        },
        'Dallas': {
          description: 'Spacious Texas ballrooms with modern amenities and Southern hospitality',
          highlights: ['Large capacity', 'Modern facilities', 'Valet parking'],
          avgPricing: '$100-220 per person',
          seasonality: 'Spring/Fall/Winter peak'
        }
      }
    },
    { 
      id: '2', 
      name: 'Barns & Farms', 
      description: 'Rustic venues with country charm and open spaces',
      citySpecializations: {
        'Austin': {
          description: 'Hill Country barns with Texas charm and live music capabilities',
          highlights: ['Hill Country views', 'Live music stages', 'BBQ-friendly'],
          avgPricing: '$80-150 per person',
          seasonality: 'Spring/Fall preferred'
        },
        'Nashville': {
          description: 'Tennessee farm venues with country music heritage and Southern charm',
          highlights: ['Music City heritage', 'Rolling hills', 'Country atmosphere'],
          avgPricing: '$70-140 per person',
          seasonality: 'Spring/Summer/Fall'
        },
        'Denver': {
          description: 'Mountain-view barn venues with Colorado outdoor lifestyle appeal',
          highlights: ['Mountain backdrops', 'Outdoor ceremonies', 'Rustic elegance'],
          avgPricing: '$90-180 per person',
          seasonality: 'Summer/Fall peak'
        }
      }
    },
    { 
      id: '3', 
      name: 'Beach/Waterfront', 
      description: 'Scenic venues along beaches, lakes, or rivers',
      citySpecializations: {
        'Miami': {
          description: 'Tropical beach venues with Art Deco influence and ocean views',
          highlights: ['South Beach locations', 'Art Deco architecture', 'Ocean ceremonies'],
          avgPricing: '$150-350 per person',
          seasonality: 'Year-round with winter premium'
        },
        'San Diego': {
          description: 'Pacific Coast beach venues with perfect weather and sunset ceremonies',
          highlights: ['Perfect weather', 'Sunset ceremonies', 'Coastal elegance'],
          avgPricing: '$140-300 per person',
          seasonality: 'Year-round'
        },
        'Charleston': {
          description: 'Historic waterfront venues with Southern charm and harbor views',
          highlights: ['Historic harbor', 'Southern elegance', 'Sunset views'],
          avgPricing: '$120-250 per person',
          seasonality: 'Spring/Fall preferred'
        }
      }
    },
    { id: '4', name: 'Gardens & Parks', description: 'Natural outdoor settings with beautiful landscaping' },
    { 
      id: '5', 
      name: 'Historic Buildings', 
      description: 'Venues with historical significance and architectural character',
      citySpecializations: {
        'Boston': {
          description: 'Colonial and Victorian-era venues with New England historical significance',
          highlights: ['Colonial architecture', 'Ivy League venues', 'Revolutionary War sites'],
          avgPricing: '$130-280 per person',
          seasonality: 'Spring/Summer/Fall with fall foliage premium'
        },
        'Philadelphia': {
          description: 'Revolutionary War era and Victorian venues with American history',
          highlights: ['Independence Hall area', 'Victorian mansions', 'Historic districts'],
          avgPricing: '$110-240 per person',
          seasonality: 'Spring/Summer/Fall'
        },
        'Savannah': {
          description: 'Antebellum mansions and historic squares with Southern Gothic charm',
          highlights: ['Antebellum architecture', 'Historic squares', 'Garden courtyards'],
          avgPricing: '$100-220 per person',
          seasonality: 'Spring/Fall preferred'
        }
      }
    },
    { id: '6', name: 'Hotels & Resorts', description: 'All-inclusive venues with accommodation and amenities' },
    { 
      id: '7', 
      name: 'Wineries & Vineyards', 
      description: 'Romantic settings among grapevines with wine-focused experiences',
      citySpecializations: {
        'Napa Valley': {
          description: 'World-class wineries with vineyard ceremonies and wine country elegance',
          highlights: ['Premium wineries', 'Vineyard ceremonies', 'Wine tastings'],
          avgPricing: '$180-400 per person',
          seasonality: 'Spring/Fall harvest season premium'
        },
        'Santa Barbara': {
          description: 'Coastal wine country with ocean breezes and vineyard mountain views',
          highlights: ['Ocean proximity', 'Mountain views', 'Boutique wineries'],
          avgPricing: '$150-320 per person',
          seasonality: 'Spring/Summer/Fall'
        }
      }
    },
    { id: '8', name: 'Industrial Spaces', description: 'Modern, urban venues with raw architectural elements' }
  ],
  'djs-and-bands': [
    { id: '1', name: 'DJs', description: 'Professional DJs specializing in wedding entertainment' },
    { id: '2', name: 'Live Bands', description: 'Full bands performing live music for your wedding' },
    { id: '3', name: 'Solo Musicians', description: 'Individual performers for ceremonies and cocktail hours' },
    { id: '4', name: 'Orchestras', description: 'Classical ensembles for an elegant wedding atmosphere' },
    { id: '5', name: 'Cultural Music Specialists', description: 'Musicians specializing in specific cultural music traditions' }
  ],
  'videographers': [
    { id: '1', name: 'Traditional Videography', description: 'Classic wedding videography with formal documentation' },
    { id: '2', name: 'Cinematic Style', description: 'Film-style wedding videos with artistic storytelling' },
    { id: '3', name: 'Documentary Style', description: 'Natural, unobtrusive documentation of your wedding day' },
    { id: '4', name: 'Drone Videography', description: 'Aerial videography for stunning overhead shots' },
    { id: '5', name: 'Live Streaming', description: 'Professional live streaming services for remote guests' }
  ],
  'cake-designers': [
    { id: '1', name: 'Traditional Cakes', description: 'Classic tiered wedding cakes with elegant designs' },
    { id: '2', name: 'Modern/Contemporary', description: 'Contemporary cake designs with unique artistic elements' },
    { id: '3', name: 'Rustic/Naked Cakes', description: 'Natural, minimally frosted cakes with rustic charm' },
    { id: '4', name: 'Specialty Dietary', description: 'Gluten-free, vegan, and other dietary restriction specialists' },
    { id: '5', name: 'Cupcakes & Dessert Bars', description: 'Alternative dessert options and cupcake towers' }
  ],
  'bridal-shops': [
    { id: '1', name: 'Designer Gowns', description: 'High-end designer wedding dress boutiques' },
    { id: '2', name: 'Budget-Friendly', description: 'Affordable wedding dress options without compromising style' },
    { id: '3', name: 'Plus Size Specialists', description: 'Boutiques specializing in plus-size wedding dresses' },
    { id: '4', name: 'Vintage/Antique', description: 'Vintage and antique wedding dress specialists' },
    { id: '5', name: 'Custom Design', description: 'Bespoke wedding dress design and tailoring services' }
  ],
  'makeup-artists': [
    { id: '1', name: 'Bridal Makeup', description: 'Traditional bridal makeup specialists' },
    { id: '2', name: 'Airbrush Makeup', description: 'Professional airbrush makeup application' },
    { id: '3', name: 'Natural/Organic', description: 'Natural and organic makeup product specialists' },
    { id: '4', name: 'Destination Wedding', description: 'Makeup artists who travel for destination weddings' },
    { id: '5', name: 'Cultural Specialists', description: 'Makeup artists specializing in cultural wedding traditions' }
  ],
  'hair-stylists': [
    { id: '1', name: 'Updos & Formal Styles', description: 'Classic bridal updo and formal hairstyling' },
    { id: '2', name: 'Natural/Boho Styles', description: 'Natural, flowing, and bohemian-inspired hairstyles' },
    { id: '3', name: 'Extensions & Volume', description: 'Hair extension and volume enhancement specialists' },
    { id: '4', name: 'Multicultural Hair', description: 'Specialists in diverse hair textures and cultural styles' },
    { id: '5', name: 'On-Location Services', description: 'Mobile hair stylists who come to your venue' }
  ],
  'wedding-decorators': [
    { id: '1', name: 'Ceremony Decor', description: 'Specialized decoration for wedding ceremonies including arches, aisle runners, and altar arrangements' },
    { id: '2', name: 'Reception Decor', description: 'Complete reception decoration including centerpieces, lighting, and table settings' },
    { id: '3', name: 'Floral Installations', description: 'Large-scale floral installations and dramatic floral displays' },
    { id: '4', name: 'Lighting Design', description: 'Professional lighting design to create ambiance and highlight key areas' },
    { id: '5', name: 'Draping & Linens', description: 'Fabric draping, specialty linens, and textile decoration services' },
    { id: '6', name: 'Themed Decor', description: 'Specialized decoration for themed weddings and cultural celebrations' }
  ],
  'carts': [
    { id: '1', name: 'Coffee Carts', description: 'Mobile coffee stations with barista service for ceremonies and receptions' },
    { id: '2', name: 'Matcha Carts', description: 'Specialty matcha and tea service carts for unique wedding experiences' },
    { id: '3', name: 'Cocktail Carts', description: 'Mobile bar carts with bartender service for cocktail hour and reception' },
    { id: '4', name: 'Dessert Carts', description: 'Mobile dessert stations with ice cream, pastries, and sweet treats' },
    { id: '5', name: 'Flower Carts', description: 'Mobile floral arrangements and flower crown stations' },
    { id: '6', name: 'Champagne Carts', description: 'Elegant champagne service carts for toasts and celebrations' }
  ]
};

// Location-aware utility functions
export const getSubcategoryForCity = (category: string, subcategoryId: string, cityName: string): SubcategoryData | null => {
  const categoryData = subcategories[category];
  if (!categoryData) return null;
  
  const subcategory = categoryData.find(sub => sub.id === subcategoryId);
  if (!subcategory) return null;
  
  // Return enhanced subcategory data with city-specific info if available
  if (subcategory.citySpecializations && subcategory.citySpecializations[cityName]) {
    return {
      ...subcategory,
      citySpecialization: subcategory.citySpecializations[cityName]
    };
  }
  
  return subcategory;
};

export const getCitySpecializedSubcategories = (category: string, cityName: string): SubcategoryData[] => {
  const categoryData = subcategories[category];
  if (!categoryData) return [];
  
  return categoryData.filter(subcategory => 
    subcategory.citySpecializations && subcategory.citySpecializations[cityName]
  );
};

export const getAllCitiesForSubcategory = (category: string, subcategoryId: string): string[] => {
  const categoryData = subcategories[category];
  if (!categoryData) return [];
  
  const subcategory = categoryData.find(sub => sub.id === subcategoryId);
  if (!subcategory || !subcategory.citySpecializations) return [];
  
  return Object.keys(subcategory.citySpecializations);
};

// SEO-optimized functions
export const generateCitySubcategoryDescription = (
  category: string, 
  subcategoryId: string, 
  cityName: string
): string => {
  const subcategory = getSubcategoryForCity(category, subcategoryId, cityName);
  if (!subcategory) return '';
  
  const citySpec = subcategory.citySpecializations?.[cityName];
  if (citySpec) {
    return `Find the best ${subcategory.name.toLowerCase()} ${category.replace('-', ' ')} in ${cityName}. ${citySpec.description} Browse reviews, compare prices, and book top-rated wedding professionals.`;
  }
  
  return `Find the best ${subcategory.name.toLowerCase()} ${category.replace('-', ' ')} in ${cityName}. ${subcategory.description} Browse reviews, compare prices, and book top-rated wedding professionals.`;
};

export const generateCitySubcategoryKeywords = (
  category: string, 
  subcategoryId: string, 
  cityName: string
): string => {
  const subcategory = getSubcategoryForCity(category, subcategoryId, cityName);
  if (!subcategory) return '';
  
  const baseKeywords = [
    `${cityName} ${subcategory.name.toLowerCase()} ${category.replace('-', ' ')}`,
    `${subcategory.name} ${category.replace('-', ' ')} ${cityName}`,
    `wedding ${subcategory.name.toLowerCase()} ${cityName}`,
    `${cityName} wedding ${category.replace('-', ' ')}`
  ];
  
  const citySpec = subcategory.citySpecializations?.[cityName];
  if (citySpec) {
    citySpec.highlights.forEach(highlight => {
      baseKeywords.push(`${highlight} ${cityName}`);
      baseKeywords.push(`${cityName} ${highlight.toLowerCase()}`);
    });
  }
  
  return baseKeywords.join(', ');
};

// City-category mapping for quick lookups
export const getCategoriesWithCitySpecializations = (cityName: string): string[] => {
  const categoriesWithCity: string[] = [];
  
  Object.keys(subcategories).forEach(category => {
    const hasSpecialization = subcategories[category].some(subcategory => 
      subcategory.citySpecializations && subcategory.citySpecializations[cityName]
    );
    if (hasSpecialization) {
      categoriesWithCity.push(category);
    }
  });
  
  return categoriesWithCity;
};

export const getCitySubcategoryPricing = (
  category: string, 
  subcategoryId: string, 
  cityName: string
): string | null => {
  const subcategory = getSubcategoryForCity(category, subcategoryId, cityName);
  return subcategory?.citySpecializations?.[cityName]?.avgPricing || null;
};

export const getCitySubcategorySeasonality = (
  category: string, 
  subcategoryId: string, 
  cityName: string
): string | null => {
  const subcategory = getSubcategoryForCity(category, subcategoryId, cityName);
  return subcategory?.citySpecializations?.[cityName]?.seasonality || null;
};
