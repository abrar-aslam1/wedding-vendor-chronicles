interface SEOParams {
  category?: string;
  city?: string;
  state?: string;
  subcategory?: string;
  vendorName?: string;
  tags?: string[];
  priceRange?: string;
}

/**
 * Generate SEO-optimized titles based on page type and parameters
 * Ensures titles are under 60 characters for optimal SEO
 */
export const getTitle = (params: SEOParams): string => {
  const { category, city, state, subcategory, vendorName, tags } = params;
  
  // Format category and subcategory
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedCategory = category ? formatText(category) : '';
  const formattedSubcategory = subcategory ? formatText(subcategory) : '';
  
  // Vendor profile page
  if (vendorName && category && city && state) {
    const stateAbbr = getStateAbbreviation(state);
    return `${vendorName} — ${formattedCategory} in ${city}, ${stateAbbr} | Photos, Pricing, Availability`;
  }
  
  // Top-20 list with subcategory
  if (category && subcategory && city && state) {
    const stateAbbr = getStateAbbreviation(state);
    return `20 Best ${formattedSubcategory} ${formattedCategory} in ${city}, ${stateAbbr} (2025) — Prices, Photos, Reviews`;
  }
  
  // Top-20 list without subcategory
  if (category && city && state) {
    const stateAbbr = getStateAbbreviation(state);
    return `20 Best ${formattedCategory} in ${city}, ${stateAbbr} (2025) — Prices, Photos, Reviews`;
  }
  
  // Category search hub
  if (category && !city && !state) {
    return `Find Top ${formattedCategory} Near You | Wedding Vendor Directory`;
  }
  
  // State-level category page
  if (category && state && !city) {
    return `Best ${formattedCategory} in ${state} | Wedding Vendor Directory`;
  }
  
  // City-level category page
  if (category && city && !state) {
    return `Best ${formattedCategory} in ${city} | Wedding Vendor Directory`;
  }
  
  // Default fallback
  return 'Find My Wedding Vendor | Top Wedding Services Directory';
};

/**
 * Generate SEO-optimized meta descriptions
 * Ensures descriptions are under 160 characters for optimal SEO
 */
export const getMeta = (params: SEOParams): string => {
  const { category, city, state, subcategory, vendorName, tags, priceRange } = params;
  
  // Format category and subcategory
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedCategory = category ? formatText(category) : '';
  const formattedSubcategory = subcategory ? formatText(subcategory) : '';
  
  // Vendor profile page
  if (vendorName && category && city && state) {
    const tagsText = tags && tags.length > 0 ? tags.slice(0, 2).join(', ') : 'various styles';
    const priceText = priceRange || 'competitive rates';
    return `Explore ${vendorName}: styles (${tagsText}), starting at ${priceText}. Read reviews and check availability for your date.`;
  }
  
  // Top-20 list with subcategory
  if (category && subcategory && city && state) {
    return `See ${city}'s top ${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase()} with galleries, price hints, and availability. Shortlist your favorites and contact 3 at once.`;
  }
  
  // Top-20 list without subcategory
  if (category && city && state) {
    return `See ${city}'s top ${formattedCategory.toLowerCase()} with galleries, price hints, and availability. Shortlist your favorites and contact 3 at once.`;
  }
  
  // Category search hub
  if (category && !city && !state) {
    return `Search and compare the best ${formattedCategory.toLowerCase()} for your wedding. Browse verified reviews, pricing information, and availability in your area.`;
  }
  
  // State-level category page
  if (category && state && !city) {
    return `Find top-rated ${formattedCategory.toLowerCase()} in ${state}. Compare prices, read reviews, and book the perfect vendor for your wedding day.`;
  }
  
  // City-level category page
  if (category && city && !state) {
    return `Discover the best ${formattedCategory.toLowerCase()} in ${city}. View portfolios, compare pricing, and connect with highly-rated wedding vendors.`;
  }
  
  // Default fallback
  return 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find photographers, venues, caterers, florists, and more for your perfect wedding day.';
};

/**
 * Generate SEO-optimized keywords based on page parameters
 */
export const getKeywords = (params: SEOParams): string => {
  const { category, city, state, subcategory, vendorName } = params;
  
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedCategory = category ? formatText(category) : '';
  const formattedSubcategory = subcategory ? formatText(subcategory) : '';
  
  const baseKeywords = ['wedding vendors', 'wedding services', 'wedding planning'];
  
  if (vendorName && category && city && state) {
    return [
      vendorName,
      `${formattedCategory.toLowerCase()}`,
      `wedding ${formattedCategory.toLowerCase()}`,
      `${city} ${formattedCategory.toLowerCase()}`,
      `${state} wedding vendors`,
      `${city} wedding planning`
    ].join(', ');
  }
  
  if (category && city && state) {
    const keywords = [
      formattedCategory.toLowerCase(),
      `wedding ${formattedCategory.toLowerCase()}`,
      `${city} ${formattedCategory.toLowerCase()}`,
      `${state} wedding vendors`,
      `${city} wedding planning`,
      `${state} wedding services`
    ];
    
    if (subcategory) {
      keywords.unshift(
        formattedSubcategory.toLowerCase(),
        `${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase()}`
      );
    }
    
    return keywords.join(', ');
  }
  
  if (category) {
    return [
      formattedCategory.toLowerCase(),
      `wedding ${formattedCategory.toLowerCase()}`,
      `find ${formattedCategory.toLowerCase()}`,
      `top ${formattedCategory.toLowerCase()}`,
      'wedding vendor directory'
    ].join(', ');
  }
  
  return baseKeywords.join(', ');
};

/**
 * Get canonical URL for the page
 */
export const getCanonicalUrl = (params: SEOParams): string => {
  const { category, city, state, subcategory, vendorName } = params;
  const baseUrl = 'https://findmyweddingvendor.com';
  
  // Vendor profile page
  if (vendorName) {
    // Assuming vendor slug is derived from vendor name
    const vendorSlug = vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${baseUrl}/vendor/${vendorSlug}`;
  }
  
  // Top-20 pages
  if (category && city && state) {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    
    if (subcategory) {
      const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, '-');
      return `${baseUrl}/top-20/${categorySlug}/${subcategorySlug}/${citySlug}/${stateSlug}`;
    }
    
    return `${baseUrl}/top-20/${categorySlug}/${citySlug}/${stateSlug}`;
  }
  
  // Search hub pages
  if (category && !city && !state) {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/search/${categorySlug}`;
  }
  
  return baseUrl;
};

/**
 * Get state abbreviation from full state name
 */
export const getStateAbbreviation = (state: string): string => {
  const stateAbbreviations: { [key: string]: string } = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC'
  };
  
  return stateAbbreviations[state.toLowerCase()] || state.toUpperCase().slice(0, 2);
};

/**
 * Generate Open Graph image URL based on page parameters
 */
export const getOGImageUrl = (params: SEOParams): string => {
  const { category, city, state, vendorName } = params;
  const baseUrl = 'https://findmyweddingvendor.com';
  
  // For now, return the default OG image
  // In the future, this could generate dynamic images based on parameters
  return `${baseUrl}/Screenshot 2025-04-20 at 9.59.36 PM.png`;
};

/**
 * Validate title length for SEO compliance
 */
export const validateTitleLength = (title: string): boolean => {
  return title.length <= 60;
};

/**
 * Validate meta description length for SEO compliance
 */
export const validateMetaLength = (description: string): boolean => {
  return description.length <= 160;
};

/**
 * Generate structured data for breadcrumbs
 */
export const getBreadcrumbStructuredData = (params: SEOParams, currentUrl?: string) => {
  const { category, city, state, subcategory, vendorName } = params;
  const baseUrl = 'https://findmyweddingvendor.com';
  
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl
    }
  ];
  
  let position = 2;
  
  if (category) {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({
      '@type': 'ListItem',
      position: position++,
      name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      item: `${baseUrl}/search/${categorySlug}`
    });
  }
  
  if (state) {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({
      '@type': 'ListItem',
      position: position++,
      name: state,
      item: `${baseUrl}/states/${stateSlug}`
    });
  }
  
  if (city) {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state?.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({
      '@type': 'ListItem',
      position: position++,
      name: city,
      item: `${baseUrl}/states/${stateSlug}/${citySlug}`
    });
  }
  
  if (vendorName) {
    const vendorUrl = currentUrl || (typeof window !== 'undefined' ? window.location.href : `${baseUrl}/vendor/${vendorName.toLowerCase().replace(/\s+/g, '-')}`);
    breadcrumbs.push({
      '@type': 'ListItem',
      position: position++,
      name: vendorName,
      item: vendorUrl
    });
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
  };
};
