import { useEffect } from 'react';

interface SEOHeadProps {
  category?: string;
  city?: string;
  state?: string;
  isHomePage?: boolean;
  totalVendors?: number;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  category,
  city,
  state,
  isHomePage = false,
  totalVendors
}) => {
  useEffect(() => {
    const generateMetadata = () => {
      if (isHomePage) {
        return {
          title: 'Find My Wedding Vendor | Top Wedding Services Directory',
          description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find the perfect match for your special day.'
        };
      }

      if (category && city && state) {
        const vendorCount = totalVendors || 'Top';
        const formattedCategory = category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          title: `${vendorCount} Best ${formattedCategory} in ${city}, ${state} | Wedding Vendor Reviews`,
          description: `Compare the ${vendorCount} best ${formattedCategory.toLowerCase()} in ${city}, ${state}. Read verified reviews, see pricing, and find the perfect ${formattedCategory.toLowerCase().slice(0, -1)} for your wedding day.`
        };
      }

      if (category) {
        const formattedCategory = category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          title: `Find Top ${formattedCategory} Near You | Wedding Vendor Directory`,
          description: `Search and compare the best ${formattedCategory.toLowerCase()} for your wedding. Browse verified reviews, pricing information, and availability in your area.`
        };
      }

      // Default fallback
      return {
        title: 'Find My Wedding Vendor | Wedding Planning Made Easy',
        description: 'Plan your perfect wedding with our comprehensive directory of wedding vendors. Compare services, read reviews, and make informed decisions for your special day.'
      };
    };

    const metadata = generateMetadata();
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);

    // Add geo meta tags if location is provided
    if (city && state) {
      let geoRegion = document.querySelector('meta[name="geo.region"]');
      let geoPlacename = document.querySelector('meta[name="geo.placename"]');

      if (!geoRegion) {
        geoRegion = document.createElement('meta');
        geoRegion.setAttribute('name', 'geo.region');
        document.head.appendChild(geoRegion);
      }
      geoRegion.setAttribute('content', `US-${state}`);

      if (!geoPlacename) {
        geoPlacename = document.createElement('meta');
        geoPlacename.setAttribute('name', 'geo.placename');
        document.head.appendChild(geoPlacename);
      }
      geoPlacename.setAttribute('content', city);
    }
  }, [category, city, state, isHomePage, totalVendors]);

  return null;
};