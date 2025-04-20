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
}

export const SchemaMarkup: FC<DirectoryPageSchema> = ({
  category,
  city,
  state,
  vendor,
  vendors = [],
  totalListings,
  isHomePage = false,
  subcategory
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
    // Determine business hours - this is a placeholder, ideally would come from vendor data
    const businessHours = [
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
        postalCode: '', // Would be good to add if available
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: v.latitude || undefined,
        longitude: v.longitude || undefined
      },
      telephone: v.phone || '',
      priceRange: '$$-$$$',
      openingHoursSpecification: businessHours,
      ...(v.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: v.rating.value,
          reviewCount: v.rating.votes_count || 0,
          bestRating: 5
        }
      }),
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

  // BreadcrumbList schema for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': window.location.origin,
          name: 'Home'
        }
      },
      ...(category ? [{
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': `${window.location.origin}/top-20/${category}`,
          name: `${category} Directory`
        }
      }] : []),
      ...(city && state ? [{
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': `${window.location.origin}/top-20/${category}/${city}/${state}`,
          name: `${city}, ${state}`
        }
      }] : [])
    ]
  };

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

  const schemas = [
    websiteSchema,
    websiteStructuredData,
    directorySchema,
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
