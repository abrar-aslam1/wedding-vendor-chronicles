import React from 'react';
import { getState, getCity } from '@/config/hashtag-locations';

interface HashtagSchemaMarkupProps {
  stateSlug?: string;
  citySlug?: string;
  canonicalUrl: string;
  imageUrl?: string;
}

export const HashtagSchemaMarkup: React.FC<HashtagSchemaMarkupProps> = ({
  stateSlug,
  citySlug,
  canonicalUrl,
  imageUrl = '/Screenshot 2025-04-20 at 9.59.36 PM.png'
}) => {
  // Base title and description
  let title = "Free Wedding Hashtag Generator | Create Your Perfect Wedding Tag";
  let description = "Generate unique, personalized wedding hashtags in seconds. Our free tool helps couples create memorable hashtags for capturing all your special moments.";
  
  // If location is provided, customize the title and description
  if (stateSlug) {
    const state = getState(stateSlug);
    
    if (state) {
      if (citySlug) {
        const city = getCity(stateSlug, citySlug);
        
        if (city) {
          title = `Wedding Hashtag Generator for ${city.name}, ${state.name} | Create Your Perfect Wedding Tag`;
          description = `Generate unique, personalized wedding hashtags for your ${city.name} wedding in seconds. Our free tool helps ${state.name} couples create memorable hashtags for capturing all your special moments.`;
        } else {
          title = `Wedding Hashtag Generator for ${state.name} | Create Your Perfect Wedding Tag`;
          description = `Generate unique, personalized wedding hashtags for your ${state.name} wedding in seconds. Our free tool helps couples create memorable hashtags for capturing all your special moments.`;
        }
      } else {
        title = `Wedding Hashtag Generator for ${state.name} | Create Your Perfect Wedding Tag`;
        description = `Generate unique, personalized wedding hashtags for your ${state.name} wedding in seconds. Our free tool helps couples create memorable hashtags for capturing all your special moments.`;
      }
    }
  }
  
  // Base schema for the website
  const websiteSchema = {
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
  
  // Schema for the organization
  const organizationSchema = {
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
  
  // Schema for the web application (hashtag generator tool)
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    description: description,
    url: canonicalUrl,
    screenshot: `${window.location.origin}${imageUrl}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156',
      bestRating: '5',
      worstRating: '1'
    }
  };
  
  // Schema for the breadcrumb list
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Wedding Tools',
        item: `${window.location.origin}/tools`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Wedding Hashtag Generator',
        item: `${window.location.origin}/tools/wedding-hashtag-generator`
      }
    ]
  };
  
  // Add location-specific breadcrumbs if available
  if (stateSlug) {
    const state = getState(stateSlug);
    
    if (state) {
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 4,
        name: state.name,
        item: `${window.location.origin}/tools/wedding-hashtag-generator/states/${stateSlug}`
      });
      
      if (citySlug) {
        const city = getCity(stateSlug, citySlug);
        
        if (city) {
          breadcrumbSchema.itemListElement.push({
            '@type': 'ListItem',
            position: 5,
            name: city.name,
            item: `${window.location.origin}/tools/wedding-hashtag-generator/states/${stateSlug}/${citySlug}`
          });
        }
      }
    }
  }
  
  // Combine all schemas
  const schemas: any[] = [
    websiteSchema,
    organizationSchema,
    webApplicationSchema,
    breadcrumbSchema
  ];
  
  // Add location-specific schema if available
  if (stateSlug && citySlug) {
    const state = getState(stateSlug);
    const city = getCity(stateSlug, citySlug);
    
    if (state && city) {
      const locationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: `${city.name}, ${state.name}`,
        description: `Wedding venues and services in ${city.name}, ${state.name}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.name,
          addressRegion: state.abbreviation,
          addressCountry: 'US'
        }
      };
      
      schemas.push(locationSchema);
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas)
      }}
    />
  );
};

export default HashtagSchemaMarkup;
