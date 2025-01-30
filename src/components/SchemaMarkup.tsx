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
}

export const SchemaMarkup: FC<DirectoryPageSchema> = ({
  category,
  city,
  state,
  vendor,
  vendors = [],
  totalListings,
  isHomePage = false
}) => {
  // Organization schema for the website itself
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Find My Wedding Vendor',
    url: window.location.origin,
    sameAs: [
      'https://facebook.com/findmyweddingvendor',
      'https://instagram.com/findmyweddingvendor'
    ]
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
  const generateVendorSchema = (v: SearchResult) => ({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'WeddingService'],
    name: v.title,
    description: v.description || v.snippet || '',
    image: v.main_image || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: v.address || '',
      addressLocality: v.city || city || '',
      addressRegion: v.state || state || '',
      addressCountry: 'US'
    },
    telephone: v.phone || '',
    priceRange: '$$-$$$',
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
      itemListElement: [
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
  });

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
  const faqSchema = category ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
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
      }
    ]
  } : null;

  const schemas = [
    websiteSchema,
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