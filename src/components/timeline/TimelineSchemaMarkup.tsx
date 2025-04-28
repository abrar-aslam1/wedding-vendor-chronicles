interface TimelineSchemaMarkupProps {
  stateSlug?: string;
  citySlug?: string;
  canonicalUrl: string;
}

const TimelineSchemaMarkup = ({ stateSlug, citySlug, canonicalUrl }: TimelineSchemaMarkupProps) => {
  // Format state and city names for display
  const formatName = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Generate title based on location
  const generateTitle = () => {
    if (citySlug && stateSlug) {
      return `Wedding Timeline Generator for ${formatName(citySlug)}, ${formatName(stateSlug)}`;
    } else if (stateSlug) {
      return `Wedding Timeline Generator for ${formatName(stateSlug)}`;
    } else {
      return "Wedding Timeline Generator: Create Your Perfect Wedding Planning Timeline";
    }
  };

  // Generate description based on location
  const generateDescription = () => {
    if (citySlug && stateSlug) {
      return `Create a personalized wedding planning timeline for your ${formatName(citySlug)}, ${formatName(stateSlug)} wedding. Our free timeline generator helps you plan your perfect day.`;
    } else if (stateSlug) {
      return `Plan your ${formatName(stateSlug)} wedding with our free timeline generator. Create a personalized wedding planning timeline tailored to your needs.`;
    } else {
      return "Create a personalized wedding planning timeline in minutes with our free wedding timeline generator. Stay organized and on track for your perfect wedding day.";
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": generateTitle(),
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": generateDescription(),
    "url": canonicalUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default TimelineSchemaMarkup;
