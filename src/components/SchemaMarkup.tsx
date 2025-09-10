import { FC } from 'react';
import { SearchResult } from '@/types/search';

interface DirectoryPageSchema {
  category?: string;
  city?: string;
  state?: string;
  vendor?: SearchResult;
  vendors?: SearchResult[];
  totalListings?: number;
  isHomePage?: boolean;
  subcategory?: string;
  eventDate?: string;
  eventLocation?: string;
  isArticle?: boolean;
  articleAuthor?: string;
  publishedDate?: string;
  modifiedDate?: string;
  articleSection?: string;
}

export const SchemaMarkup: FC<DirectoryPageSchema> = ({
  category,
  city,
  state,
  vendor,
  vendors = [],
  totalListings,
  isHomePage = false,
  subcategory,
  eventDate,
  eventLocation,
  isArticle = false,
  articleAuthor,
  publishedDate,
  modifiedDate,
  articleSection
}) => {
  // Organization schema for the website itself
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Find My Wedding Vendor',
    url: window.location.origin,
    logo: `${window.location.origin}/og-image.png`,
    description: 'Find My Wedding Vendor helps couples discover and connect with the best wedding vendors for their special day.',
    sameAs: [
      'https://facebook.com/findmyweddingvendor',
      'https://instagram.com/findmyweddingvendor'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@findmyweddingvendor.com'
    }
  };
  
  // WebSite schema for better site representation in search results
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Find My Wedding Vendor',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Directory schema for category pages
  const directorySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    specialty: 'Wedding Services Directory',
    about: {
      '@type': 'BusinessDirectory',
      name: category ? `${category} Directory` : 'Wedding Vendor Directory',
      description: category 
        ? `Directory of wedding ${category.toLowerCase()} services${city ? ` in ${city}, ${state}` : ''}`
        : 'Comprehensive directory of wedding services and vendors',
      numberOfItems: totalListings || vendors.length
    }
  };

  // Local Business schema for vendor listings
  const generateVendorSchema = (v: SearchResult) => {
    // Use actual business hours if available, otherwise use default placeholder
    const businessHours = v.business_hours && v.business_hours.length > 0
      ? v.business_hours.map(hour => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hour.day,
          opens: hour.opens,
          closes: hour.closes
        }))
      : [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '10:00',
            closes: '15:00'
          }
        ];
    
    // Generate service offerings based on category and subcategory
    const serviceOfferings = [];
    if (category) {
      serviceOfferings.push({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `Wedding ${category} Services`,
          description: `Professional ${category.toLowerCase()} services for weddings and special events`
        }
      });
    }
    
    if (subcategory) {
      serviceOfferings.push({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${subcategory} ${category || 'Wedding'} Services`,
          description: `Specialized ${subcategory.toLowerCase()} services for weddings and special events`
        }
      });
    }
    
    // Add reviews schema if available
    const reviews = v.reviews && v.reviews.length > 0
      ? v.reviews.map(review => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.author
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: '5'
          },
          reviewBody: review.text,
          datePublished: review.date || new Date().toISOString().split('T')[0]
        }))
      : undefined;
    
    // Create service area if available
    const serviceAreaSchema = v.service_area && v.service_area.length > 0 && v.latitude && v.longitude
      ? {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: v.latitude,
            longitude: v.longitude
          },
          geoRadius: '50mi' // Default radius
        }
      : undefined;
    
    return {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'WeddingService'],
      '@id': v.place_id ? `https://maps.google.com/?cid=${v.place_id}` : undefined,
      name: v.title,
      description: v.description || v.snippet || '',
      image: v.main_image || '',
      url: v.url || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: v.address || '',
        addressLocality: v.city || city || '',
        addressRegion: v.state || state || '',
        postalCode: v.postal_code || '',
        addressCountry: 'US'
      },
      geo: v.latitude && v.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: v.latitude,
        longitude: v.longitude
      } : undefined,
      telephone: v.phone || '',
      email: v.email || undefined,
      priceRange: v.price_range || '$$-$$$',
      paymentAccepted: v.payment_methods && v.payment_methods.length > 0 
        ? v.payment_methods.join(', ') 
        : undefined,
      foundingDate: v.year_established,
      areaServed: serviceAreaSchema,
      openingHoursSpecification: businessHours,
      ...(v.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: v.rating.value,
          reviewCount: v.rating.votes_count || 0,
          bestRating: 5
        }
      }),
      ...(reviews && { review: reviews }),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Wedding Services',
        itemListElement: serviceOfferings.length > 0 ? serviceOfferings : [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: `Wedding ${category || ''} Services`,
              description: `Professional ${(category || '').toLowerCase()} services for weddings and special events`
            }
          }
        ]
      }
    };
  };

  const vendorSchemas = vendor 
    ? [generateVendorSchema(vendor)]
    : vendors.map(generateVendorSchema);

  // ItemList schema for Top-20 pages (as specified in agent brief)
  const generateItemListSchema = () => {
    if (!vendors || vendors.length === 0 || !category) return null;
    
    const formatText = (text: string) => {
      return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const categoryLabel = formatText(category);
    const subcategoryLabel = subcategory ? formatText(subcategory) : '';
    const locationString = city && state ? ` in ${city}, ${state}` : '';
    
    const listName = subcategory 
      ? `Top 20 ${subcategoryLabel} ${categoryLabel}${locationString}`
      : `Top 20 ${categoryLabel}${locationString}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListOrder': 'https://schema.org/ItemListOrderAscending',
      'name': listName,
      'numberOfItems': vendors.length,
      'itemListElement': vendors.map((v, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'url': `https://findmyweddingvendor.com/vendor/${v.place_id || v.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        'name': v.title,
        'item': {
          '@type': 'LocalBusiness',
          'name': v.title,
          'description': v.description || v.snippet || '',
          'image': v.main_image || '',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': v.city || city || '',
            'addressRegion': v.state || state || '',
            'addressCountry': 'US'
          },
          ...(v.rating && {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': v.rating.value,
              'reviewCount': v.rating.votes_count || 0,
              'bestRating': 5
            }
          })
        }
      }))
    };
  };

  const itemListSchema = generateItemListSchema();

  // Enhanced BreadcrumbList schema for navigation
  const generateBreadcrumbSchema = () => {
    const baseUrl = window.location.origin;
    const breadcrumbs = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      }
    ];

    let position = 2;

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

    if (category) {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      const formatText = (text: string) => {
        return text
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
      
      breadcrumbs.push({
        '@type': 'ListItem',
        position: position++,
        name: formatText(category),
        item: city && state 
          ? `${baseUrl}/top-20/${categorySlug}/${city.toLowerCase().replace(/\s+/g, '-')}/${state.toLowerCase().replace(/\s+/g, '-')}`
          : `${baseUrl}/search/${categorySlug}`
      });
    }

    if (subcategory) {
      const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, '-');
      const categorySlug = category?.toLowerCase().replace(/\s+/g, '-');
      const citySlug = city?.toLowerCase().replace(/\s+/g, '-');
      const stateSlug = state?.toLowerCase().replace(/\s+/g, '-');
      
      const formatText = (text: string) => {
        return text
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      breadcrumbs.push({
        '@type': 'ListItem',
        position: position++,
        name: formatText(subcategory),
        item: `${baseUrl}/top-20/${categorySlug}/${subcategorySlug}/${citySlug}/${stateSlug}`
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs
    };
  };

  const breadcrumbSchema = generateBreadcrumbSchema();

  // FAQPage schema for category-specific FAQs
  const generateFaqSchema = () => {
    if (!category) return null;
    
    // Base questions for all categories
    const baseQuestions = [
      {
        '@type': 'Question',
        name: `How do I choose a wedding ${category.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `When choosing a wedding ${category.toLowerCase()}, consider their experience, portfolio, reviews from past clients, pricing, and availability for your wedding date. Schedule consultations with multiple vendors to find the best fit.`
        }
      },
      {
        '@type': 'Question',
        name: `What should I look for in a wedding ${category.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Look for a ${category.toLowerCase()} with proven experience in weddings, positive reviews, clear pricing, and good communication. They should understand your vision and style while providing professional guidance and support.`
        }
      },
      {
        '@type': 'Question',
        name: `How far in advance should I book a wedding ${category.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Most wedding ${category.toLowerCase()} vendors should be booked 9-12 months before your wedding date. Popular vendors in high-demand seasons may require booking 12-18 months in advance to secure your date.`
        }
      },
      {
        '@type': 'Question',
        name: `What questions should I ask before hiring a wedding ${category.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Important questions to ask include: Are you available on my wedding date? What's included in your packages and pricing? Do you have insurance? Can I see examples of your previous work? What is your cancellation policy? How much experience do you have with weddings specifically?`
        }
      }
    ];
    
    // Category-specific questions
    const categoryQuestions = {
      'photographers': [
        {
          '@type': 'Question',
          name: 'How many hours of coverage do I need for wedding photography?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most weddings require 8-10 hours of photography coverage to capture everything from getting ready through the reception. For smaller weddings, 6 hours may be sufficient, while larger events might need 12+ hours.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do wedding photographers provide raw, unedited photos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most professional wedding photographers do not provide raw, unedited photos as part of their service. Editing is considered an essential part of their artistic process and final product.'
          }
        }
      ],
      'venues': [
        {
          '@type': 'Question',
          name: 'What should be included in a wedding venue contract?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A comprehensive wedding venue contract should include the date and time of your event, rental fees, deposit amount, payment schedule, cancellation policy, liability insurance requirements, catering options, alcohol policies, decoration restrictions, and setup/cleanup responsibilities.'
          }
        },
        {
          '@type': 'Question',
          name: 'How do I calculate how much space I need for my wedding venue?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'As a general rule, allow 25-30 square feet per guest for a seated dinner with a dance floor. For a cocktail-style reception, you can estimate 15-20 square feet per guest. Always confirm with your venue about their maximum capacity guidelines.'
          }
        }
      ],
      'caterers': [
        {
          '@type': 'Question',
          name: 'How much food should I order for my wedding reception?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For a plated dinner, plan for one serving per person. For buffet-style service, caterers typically prepare for 1.5 servings per person to ensure you don\'t run out. For appetizers during cocktail hour, plan for 3-5 pieces per person per hour.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do wedding caterers provide tastings before booking?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most reputable wedding caterers offer tastings, though policies vary. Some provide complimentary tastings once you\'ve expressed serious interest, while others charge a fee that may be applied to your final bill if you book their services.'
          }
        }
      ],
      'florists': [
        {
          '@type': 'Question',
          name: 'What flowers are in season for my wedding date?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Spring (March-May): Tulips, peonies, lilacs, and cherry blossoms. Summer (June-August): Roses, sunflowers, dahlias, and hydrangeas. Fall (September-November): Chrysanthemums, marigolds, and dahlias. Winter (December-February): Amaryllis, camellias, and poinsettias. Using in-season flowers can significantly reduce your floral budget.'
          }
        },
        {
          '@type': 'Question',
          name: 'How can I preserve my wedding bouquet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Popular methods for preserving wedding bouquets include air-drying (hanging upside down), pressing, silica gel drying, freeze-drying (professional service), or having it professionally preserved in resin or a shadow box. For best results, start the preservation process within 48 hours after your wedding.'
          }
        }
      ]
    };
    
    // Get category-specific questions if available
    const specificQuestions = categoryQuestions[category.toLowerCase()] || [];
    
    // Combine base and specific questions
    const allQuestions = [...baseQuestions, ...specificQuestions];
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allQuestions
    };
  };
  
  const faqSchema = generateFaqSchema();

  // Generate a location-specific schema for better local SEO
  const generateLocationSchema = () => {
    if (!city || !state) return null;
    
    // Try to get coordinates from the first vendor if available
    const firstVendorWithCoords = vendors.find(v => v.latitude && v.longitude);
    const latitude = firstVendorWithCoords?.latitude;
    const longitude = firstVendorWithCoords?.longitude;
    
    // Get approximate coordinates for common cities if not available from vendors
    const getApproximateCoordinates = () => {
      // This is a simplified example with hardcoded values for common cities
      const coordinates = {
        'New York': { 'NY': { lat: 40.7128, lng: -74.0060 } },
        'Los Angeles': { 'CA': { lat: 34.0522, lng: -118.2437 } },
        'Chicago': { 'IL': { lat: 41.8781, lng: -87.6298 } },
        'Houston': { 'TX': { lat: 29.7604, lng: -95.3698 } },
        'Phoenix': { 'AZ': { lat: 33.4484, lng: -112.0740 } },
        'Philadelphia': { 'PA': { lat: 39.9526, lng: -75.1652 } },
        'San Antonio': { 'TX': { lat: 29.4241, lng: -98.4936 } },
        'San Diego': { 'CA': { lat: 32.7157, lng: -117.1611 } },
        'Dallas': { 'TX': { lat: 32.7767, lng: -96.7970 } },
        'San Jose': { 'CA': { lat: 37.3382, lng: -121.8863 } },
        'Austin': { 'TX': { lat: 30.2672, lng: -97.7431 } },
        'Jacksonville': { 'FL': { lat: 30.3322, lng: -81.6557 } },
        'Fort Worth': { 'TX': { lat: 32.7555, lng: -97.3308 } },
        'Columbus': { 'OH': { lat: 39.9612, lng: -82.9988 } },
        'Charlotte': { 'NC': { lat: 35.2271, lng: -80.8431 } },
        'San Francisco': { 'CA': { lat: 37.7749, lng: -122.4194 } },
        'Indianapolis': { 'IN': { lat: 39.7684, lng: -86.1581 } },
        'Seattle': { 'WA': { lat: 47.6062, lng: -122.3321 } },
        'Denver': { 'CO': { lat: 39.7392, lng: -104.9903 } },
        'Washington': { 'DC': { lat: 38.9072, lng: -77.0369 } }
      };
      
      return coordinates[city]?.[state];
    };
    
    const coords = latitude && longitude 
      ? { lat: latitude, lng: longitude }
      : getApproximateCoordinates();
    
    // Create location-specific schema
    return {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${city}, ${state}`,
      description: `Wedding vendors and services in ${city}, ${state}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressRegion: state,
        addressCountry: 'US'
      },
      ...(coords ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coords.lat,
          longitude: coords.lng
        }
      } : {})
    };
  };
  
  // Generate location-specific FAQs
  const generateLocationFaqs = () => {
    if (!category || !city || !state) return [];
    
    // Get top vendor names for this location (up to 3)
    const topVendorNames = vendors
      .slice(0, 3)
      .map(v => v.title)
      .filter(Boolean);
    
    const vendorNamesText = topVendorNames.length > 0
      ? `The top-rated wedding ${category.toLowerCase()} in ${city}, ${state} include ${topVendorNames.join(', ')}. These vendors have excellent reviews and are highly recommended by local couples.`
      : `There are several highly-rated wedding ${category.toLowerCase()} in ${city}, ${state}. We recommend contacting vendors directly to check their availability for your wedding date.`;
    
    return [
      {
        '@type': 'Question',
        name: `What are the best wedding ${category.toLowerCase()} in ${city}, ${state}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: vendorNamesText
        }
      },
      {
        '@type': 'Question',
        name: `How much do wedding ${category.toLowerCase()} cost in ${city}, ${state}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Wedding ${category.toLowerCase()} in ${city}, ${state} typically range from $1,000 to $5,000 depending on experience, package options, and specific requirements. It's recommended to contact vendors directly for accurate pricing information.`
        }
      },
      {
        '@type': 'Question',
        name: `When should I book a wedding ${category.toLowerCase()} in ${city}, ${state}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In ${city}, ${state}, it's advisable to book your wedding ${category.toLowerCase()} 9-12 months in advance, especially during peak wedding season (May-October). Popular vendors may be booked 12-18 months in advance for prime dates.`
        }
      }
    ];
  };
  
  // Generate Event schema for wedding-related events
  const generateEventSchema = () => {
    if (!eventDate || !eventLocation) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `Wedding Planning Event${city ? ` in ${city}, ${state}` : ''}`,
      description: `Wedding planning and vendor showcase event${category ? ` featuring ${category.toLowerCase()}` : ''}`,
      startDate: eventDate,
      location: {
        '@type': 'Place',
        name: eventLocation,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city || '',
          addressRegion: state || '',
          addressCountry: 'US'
        }
      },
      organizer: {
        '@type': 'Organization',
        name: 'Find My Wedding Vendor',
        url: window.location.origin
      },
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
    };
  };

  // Generate Article schema for blog posts and guides
  const generateArticleSchema = () => {
    if (!isArticle) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: document.title || 'Wedding Planning Guide',
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      author: {
        '@type': 'Person',
        name: articleAuthor || 'Find My Wedding Vendor Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Find My Wedding Vendor',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/Screenshot 2025-04-20 at 9.59.36 PM.png`
        }
      },
      datePublished: publishedDate || new Date().toISOString(),
      dateModified: modifiedDate || publishedDate || new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      },
      articleSection: articleSection || 'Wedding Planning',
      keywords: category ? `wedding planning, ${category.toLowerCase()}, wedding vendors` : 'wedding planning, wedding vendors'
    };
  };

  // Generate Service schema for wedding services
  const generateServiceSchema = () => {
    if (!category) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Wedding ${category} Services`,
      description: `Professional ${category.toLowerCase()} services for weddings and special events`,
      provider: {
        '@type': 'Organization',
        name: 'Find My Wedding Vendor'
      },
      areaServed: city && state ? {
        '@type': 'Place',
        name: `${city}, ${state}`
      } : {
        '@type': 'Country',
        name: 'United States'
      },
      serviceType: `Wedding ${category}`,
      category: 'Wedding Services'
    };
  };

  // Get location schema
  const locationSchema = generateLocationSchema();
  const eventSchema = generateEventSchema();
  const articleSchema = generateArticleSchema();
  const serviceSchema = generateServiceSchema();
  
  // Add location-specific FAQs to the FAQ schema
  if (faqSchema && city && state) {
    const locationFaqs = generateLocationFaqs();
    if (locationFaqs.length > 0) {
      faqSchema.mainEntity = [...faqSchema.mainEntity, ...locationFaqs];
    }
  }

  const schemas = [
    websiteSchema,
    websiteStructuredData,
    directorySchema,
    ...(locationSchema ? [locationSchema] : []),
    ...(eventSchema ? [eventSchema] : []),
    ...(articleSchema ? [articleSchema] : []),
    ...(serviceSchema ? [serviceSchema] : []),
    ...(itemListSchema ? [itemListSchema] : []),
    ...vendorSchemas,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : [])
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas)
      }}
    />
  );
};
