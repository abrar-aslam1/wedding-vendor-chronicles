import React from "react";
import { getLocationData } from "@/config/hashtag-locations";

interface HashtagSchemaMarkupProps {
  stateSlug?: string;
  citySlug?: string;
  canonicalUrl: string;
}

const HashtagSchemaMarkup: React.FC<HashtagSchemaMarkupProps> = ({
  stateSlug,
  citySlug,
  canonicalUrl
}) => {
  // Get location data
  const { state, city } = getLocationData(stateSlug, citySlug);
  
  // Base schema for the tool
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Wedding Hashtag Generator",
    "url": canonicalUrl,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Generate unique, personalized wedding hashtags in seconds. Our free tool helps couples create memorable hashtags for capturing all your special moments.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156"
    }
  };
  
  // Location-specific schema
  const locationSchema = stateSlug ? {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": city ? `${city.cityName}, ${state?.stateName}` : state?.stateName,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": state?.stateName,
      "addressLocality": city?.cityName
    }
  } : null;
  
  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://findmyweddingvendor.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Wedding Tools",
        "item": "https://findmyweddingvendor.com/tools/wedding-hashtag-generator"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Wedding Hashtag Generator",
        "item": "https://findmyweddingvendor.com/tools/wedding-hashtag-generator"
      }
    ]
  };
  
  // Add location items to breadcrumb if applicable
  if (stateSlug) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 4,
      "name": "States",
      "item": "https://findmyweddingvendor.com/tools/wedding-hashtag-generator/states"
    });

    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 5,
      "name": state?.stateName || stateSlug,
      "item": `https://findmyweddingvendor.com/tools/wedding-hashtag-generator/states/${stateSlug}`
    });

    if (citySlug) {
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": 6,
        "name": city?.cityName || citySlug,
        "item": `https://findmyweddingvendor.com/tools/wedding-hashtag-generator/states/${stateSlug}/${citySlug}`
      });
    }
  }
  
  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {locationSchema && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
        />
      )}
    </>
  );
};

export default HashtagSchemaMarkup;
