/**
 * Taxonomy utilities for handling category and subcategory names
 * Fixes issues like "djs djs and bands" duplication
 */

interface TaxonomyMapping {
  [key: string]: string;
}

/**
 * Mapping of common category slugs to their proper display names
 * This prevents duplication and ensures consistent formatting
 */
const CATEGORY_MAPPINGS: TaxonomyMapping = {
  // Music & Entertainment
  'djs': 'DJs',
  'djs-and-bands': 'DJs and Bands',
  'djs-djs-and-bands': 'DJs and Bands', // Fix duplication
  'bands': 'Bands',
  'musicians': 'Musicians',
  'live-music': 'Live Music',
  'wedding-bands': 'Wedding Bands',
  'acoustic-musicians': 'Acoustic Musicians',
  'string-quartets': 'String Quartets',
  
  // Photography & Videography
  'photographers': 'Photographers',
  'wedding-photographers': 'Wedding Photographers',
  'engagement-photographers': 'Engagement Photographers',
  'videographers': 'Videographers',
  'wedding-videographers': 'Wedding Videographers',
  'photo-booth-rentals': 'Photo Booth Rentals',
  'drone-photographers': 'Drone Photographers',
  
  // Venues
  'venues': 'Venues',
  'wedding-venues': 'Wedding Venues',
  'reception-venues': 'Reception Venues',
  'ceremony-venues': 'Ceremony Venues',
  'outdoor-venues': 'Outdoor Venues',
  'indoor-venues': 'Indoor Venues',
  'barn-venues': 'Barn Venues',
  'beach-venues': 'Beach Venues',
  'garden-venues': 'Garden Venues',
  'historic-venues': 'Historic Venues',
  'hotel-venues': 'Hotel Venues',
  'restaurant-venues': 'Restaurant Venues',
  
  // Catering & Food
  'caterers': 'Caterers',
  'wedding-caterers': 'Wedding Caterers',
  'cake-designers': 'Cake Designers',
  'wedding-cakes': 'Wedding Cakes',
  'dessert-tables': 'Dessert Tables',
  'bartenders': 'Bartenders',
  'mobile-bars': 'Mobile Bars',
  'food-trucks': 'Food Trucks',
  
  // Beauty & Fashion
  'makeup-artists': 'Makeup Artists',
  'wedding-makeup': 'Wedding Makeup',
  'hair-stylists': 'Hair Stylists',
  'wedding-hair': 'Wedding Hair',
  'bridal-shops': 'Bridal Shops',
  'wedding-dresses': 'Wedding Dresses',
  'tuxedo-rentals': 'Tuxedo Rentals',
  'jewelry': 'Jewelry',
  'wedding-rings': 'Wedding Rings',
  
  // Flowers & Decor
  'florists': 'Florists',
  'wedding-flowers': 'Wedding Flowers',
  'bridal-bouquets': 'Bridal Bouquets',
  'centerpieces': 'Centerpieces',
  'wedding-decorators': 'Wedding Decorators',
  'event-decorators': 'Event Decorators',
  'lighting-designers': 'Lighting Designers',
  'linens-and-rentals': 'Linens and Rentals',
  'tent-rentals': 'Tent Rentals',
  'furniture-rentals': 'Furniture Rentals',
  
  // Planning & Coordination
  'wedding-planners': 'Wedding Planners',
  'event-planners': 'Event Planners',
  'day-of-coordinators': 'Day-of Coordinators',
  'wedding-coordinators': 'Wedding Coordinators',
  'destination-wedding-planners': 'Destination Wedding Planners',
  
  // Transportation
  'transportation': 'Transportation',
  'wedding-transportation': 'Wedding Transportation',
  'limo-services': 'Limo Services',
  'car-rentals': 'Car Rentals',
  'shuttle-services': 'Shuttle Services',
  'vintage-cars': 'Vintage Cars',
  
  // Specialty Services
  'officiants': 'Officiants',
  'wedding-officiants': 'Wedding Officiants',
  'ministers': 'Ministers',
  'justices-of-peace': 'Justices of Peace',
  'invitations': 'Invitations',
  'wedding-invitations': 'Wedding Invitations',
  'stationery': 'Stationery',
  'calligraphy': 'Calligraphy',
  'wedding-favors': 'Wedding Favors',
  'gift-registries': 'Gift Registries'
};

/**
 * Convert a slug to a properly formatted label
 * Handles special cases and prevents duplication
 */
export const slugToLabel = (slug: string): string => {
  if (!slug) return '';
  
  // Normalize the slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Check for exact mapping first
  if (CATEGORY_MAPPINGS[normalizedSlug]) {
    return CATEGORY_MAPPINGS[normalizedSlug];
  }
  
  // Handle common duplication patterns
  const cleanedSlug = removeDuplication(normalizedSlug);
  if (CATEGORY_MAPPINGS[cleanedSlug]) {
    return CATEGORY_MAPPINGS[cleanedSlug];
  }
  
  // Fallback to title case conversion
  return toTitleCase(cleanedSlug);
};

/**
 * Remove common duplication patterns from slugs
 */
const removeDuplication = (slug: string): string => {
  let cleanedSlug = slug;
  
  // Handle "djs djs and bands" -> "djs and bands"
  if (cleanedSlug.includes('djs djs')) {
    cleanedSlug = cleanedSlug.replace(/djs\s+djs/g, 'djs').replace(/djs-djs/g, 'djs');
  }
  
  // Handle complex patterns like "djs djs and bands and bands"
  cleanedSlug = cleanedSlug.replace(/(\bdjs\s+djs\s+and\s+bands)\s+and\s+bands/g, 'djs and bands');
  cleanedSlug = cleanedSlug.replace(/(\bdjs-djs-and-bands)-and-bands/g, 'djs-and-bands');
  
  // Remove repeated "and bands" patterns
  cleanedSlug = cleanedSlug.replace(/(\band\s+bands)\s+\1/g, '$1');
  cleanedSlug = cleanedSlug.replace(/(\band-bands)-\1/g, '$1');
  
  // Handle complex venue patterns like "venues wedding venues venues" -> "wedding venues"
  cleanedSlug = cleanedSlug.replace(/\bvenues\s+wedding\s+venues\s+venues\b/g, 'wedding venues');
  cleanedSlug = cleanedSlug.replace(/\bvenues-wedding-venues-venues\b/g, 'wedding-venues');
  
  // Handle other common duplications
  const words = cleanedSlug.split(/[-\s]+/);
  const uniqueWords: string[] = [];
  
  // First pass: handle complex patterns where we want to keep the more specific term
  // For patterns like "venues wedding venues venues", we want "wedding venues"
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Special case: if we have "word1 word2 word1 word1", prefer "word2 word1"
    if (i > 0 && i < words.length - 1) {
      const prevWord = words[i - 1];
      const nextWord = words[i + 1];
      
      // If current word appears at start and we have a more specific combination
      if (word === words[0] && prevWord !== word && nextWord === word) {
        // Skip the first occurrence, keep the middle combination
        if (i === words.length - 2) {
          // This is the pattern we want: skip first word, keep "prevWord word"
          continue;
        }
      }
    }
    
    // Special handling for "and bands and bands" pattern
    if (word === 'and' && i + 1 < words.length && words[i + 1] === 'bands') {
      // Check if we already have "and bands" in the sequence
      const lastTwoWords = uniqueWords.slice(-2).join(' ');
      if (lastTwoWords !== 'and bands') {
        uniqueWords.push(word);
      }
    } else if (word === 'bands' && uniqueWords.length >= 2 && 
               uniqueWords[uniqueWords.length - 1] === 'and' && 
               uniqueWords[uniqueWords.length - 2] === 'bands') {
      // Skip this "bands" as we already have "and bands" pattern
      continue;
    } else if (i === 0 || word !== words[i - 1]) {
      // Don't add if it's a duplicate of the previous word
      uniqueWords.push(word);
    }
  }
  
  // Second pass: clean up any remaining duplicates at the end
  const finalWords: string[] = [];
  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i];
    
    // Skip if this word appears again later in a more specific context
    if (i < uniqueWords.length - 2 && 
        word === uniqueWords[i + 2] && 
        uniqueWords[i + 1] !== word) {
      // Skip the first occurrence, keep the later more specific one
      continue;
    }
    
    finalWords.push(word);
  }
  
  return finalWords.join('-');
};

/**
 * Convert a slug to title case
 */
const toTitleCase = (slug: string): string => {
  return slug
    .split(/[-\s]+/)
    .map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'djs') return 'DJs';
      if (word.toLowerCase() === 'and') return 'and';
      if (word.toLowerCase() === 'of') return 'of';
      if (word.toLowerCase() === 'the') return 'the';
      if (word.toLowerCase() === 'in') return 'in';
      if (word.toLowerCase() === 'on') return 'on';
      if (word.toLowerCase() === 'at') return 'at';
      if (word.toLowerCase() === 'by') return 'by';
      if (word.toLowerCase() === 'for') return 'for';
      if (word.toLowerCase() === 'with') return 'with';
      
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Get the canonical slug for a category
 * This ensures consistent URL structure
 */
export const getCanonicalSlug = (input: string): string => {
  if (!input) return '';
  
  const normalizedInput = input.toLowerCase().trim();
  
  // Handle known problematic cases
  const duplicatePatterns = [
    { pattern: /djs[\s-]+djs[\s-]+and[\s-]+bands[\s-]+and[\s-]+bands/g, replacement: 'djs-and-bands' },
    { pattern: /djs[\s-]+djs[\s-]+and[\s-]+bands/g, replacement: 'djs-and-bands' },
    { pattern: /djs[\s-]+djs/g, replacement: 'djs' },
    { pattern: /and[\s-]+bands[\s-]+and[\s-]+bands/g, replacement: 'and-bands' },
    { pattern: /bands[\s-]+bands/g, replacement: 'bands' },
    { pattern: /photographers[\s-]+photographers/g, replacement: 'photographers' },
    { pattern: /venues[\s-]+venues/g, replacement: 'venues' }
  ];
  
  let cleanedInput = normalizedInput;
  
  // Apply duplicate pattern fixes
  duplicatePatterns.forEach(({ pattern, replacement }) => {
    cleanedInput = cleanedInput.replace(pattern, replacement);
  });
  
  // Convert to proper slug format
  return cleanedInput
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate that a category name doesn't contain duplications
 */
export const validateCategoryName = (name: string): boolean => {
  if (!name || !name.trim()) return false;
  
  const normalizedName = name.toLowerCase().trim();
  
  // Check for obvious duplications
  const duplicatePatterns = [
    /djs\s+djs/,
    /bands\s+bands/,
    /photographers\s+photographers/,
    /venues\s+venues/,
    /caterers\s+caterers/,
    /florists\s+florists/
  ];
  
  return !duplicatePatterns.some(pattern => pattern.test(normalizedName));
};

/**
 * Get SEO-friendly category name for URLs and titles
 */
export const getSEOCategoryName = (category: string, subcategory?: string): string => {
  const categoryLabel = slugToLabel(category);
  
  if (!subcategory) {
    return categoryLabel;
  }
  
  const subcategoryLabel = slugToLabel(subcategory);
  
  // Avoid redundancy like "Wedding Wedding Photographers"
  if (subcategoryLabel.toLowerCase().includes(categoryLabel.toLowerCase())) {
    return subcategoryLabel;
  }
  
  return `${subcategoryLabel} ${categoryLabel}`;
};

/**
 * Get all valid category mappings for testing/validation
 */
export const getCategoryMappings = (): TaxonomyMapping => {
  return { ...CATEGORY_MAPPINGS };
};

/**
 * Check if a slug has a known mapping
 */
export const hasKnownMapping = (slug: string): boolean => {
  return slug.toLowerCase() in CATEGORY_MAPPINGS;
};

/**
 * Get suggestions for similar category names
 */
export const getSimilarCategories = (input: string, limit: number = 5): string[] => {
  if (!input) return [];
  
  const normalizedInput = input.toLowerCase();
  const suggestions: string[] = [];
  
  // Find exact matches first
  Object.keys(CATEGORY_MAPPINGS).forEach(slug => {
    if (slug.includes(normalizedInput) || normalizedInput.includes(slug)) {
      suggestions.push(CATEGORY_MAPPINGS[slug]);
    }
  });
  
  // Remove duplicates and limit results
  return [...new Set(suggestions)].slice(0, limit);
};
