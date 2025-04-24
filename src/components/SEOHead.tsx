import { useEffect } from 'react';

interface SEOHeadProps {
  category?: string;
  city?: string;
  state?: string;
  isHomePage?: boolean;
  totalVendors?: number;
  subcategory?: string;
  imageUrl?: string;
  canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  category,
  city,
  state,
  isHomePage = false,
  totalVendors,
  subcategory,
  imageUrl,
  canonicalUrl
}) => {
  useEffect(() => {
    const formatText = (text: string) => {
      return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    const generateMetadata = () => {
      // Format category and subcategory if they exist
      const formattedCategory = category ? formatText(category) : '';
      const formattedSubcategory = subcategory ? formatText(subcategory) : '';
      const vendorCount = totalVendors || 'Top 20';
      
      // Generate location string if city and state are provided
      const locationString = city && state ? `in ${city}, ${state}` : 'Near You';
      
      // Generate title and description based on available information
      if (isHomePage) {
        return {
          title: 'Find My Wedding Vendor | Top Wedding Services Directory',
          description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find the perfect match for your special day.',
          keywords: 'wedding vendors, wedding services, wedding planning, wedding directory, find wedding vendors',
          type: 'website'
        };
      }

      if (category && subcategory && city && state) {
        return {
          title: `${vendorCount} Best ${formattedSubcategory} ${formattedCategory} ${locationString} | Wedding Vendor Reviews`,
          description: `Compare the ${vendorCount} best ${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase()} ${locationString}. Read verified reviews, see pricing, and find the perfect ${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase().slice(0, -1)} for your wedding day.`,
          keywords: `${formattedSubcategory.toLowerCase()}, ${formattedCategory.toLowerCase()}, wedding ${formattedCategory.toLowerCase()}, ${city} ${formattedCategory.toLowerCase()}, ${state} wedding vendors, ${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase()}`,
          type: 'business.business'
        };
      }

      if (category && city && state) {
        return {
          title: `${vendorCount} Best ${formattedCategory} ${locationString} | Wedding Vendor Reviews`,
          description: `Compare the ${vendorCount} best ${formattedCategory.toLowerCase()} ${locationString}. Read verified reviews, see pricing, and find the perfect ${formattedCategory.toLowerCase().slice(0, -1)} for your wedding day.`,
          keywords: `${formattedCategory.toLowerCase()}, wedding ${formattedCategory.toLowerCase()}, ${city} ${formattedCategory.toLowerCase()}, ${state} wedding vendors`,
          type: 'business.business'
        };
      }

      if (category) {
        return {
          title: `Find Top ${formattedCategory} Near You | Wedding Vendor Directory`,
          description: `Search and compare the best ${formattedCategory.toLowerCase()} for your wedding. Browse verified reviews, pricing information, and availability in your area.`,
          keywords: `${formattedCategory.toLowerCase()}, wedding ${formattedCategory.toLowerCase()}, find ${formattedCategory.toLowerCase()}, top ${formattedCategory.toLowerCase()}`,
          type: 'website'
        };
      }

      // Default fallback
      return {
        title: 'Find My Wedding Vendor | Wedding Planning Made Easy',
        description: 'Plan your perfect wedding with our comprehensive directory of wedding vendors. Compare services, read reviews, and make informed decisions for your special day.',
        keywords: 'wedding planning, wedding vendors, wedding services, wedding directory',
        type: 'website'
      };
    };

    const metadata = generateMetadata();
    const siteUrl = window.location.origin;
    const currentUrl = canonicalUrl || window.location.href;
    const defaultImage = `${siteUrl}/Screenshot 2025-04-20 at 9.59.36 PM.png`;
    const pageImage = imageUrl || defaultImage;
    
    // Set basic meta tags
    document.title = metadata.title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metadata.description);
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', metadata.keywords);
    
    // Set canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', currentUrl);
    
    // Set Open Graph meta tags
    const ogTags = {
      'og:title': metadata.title,
      'og:description': metadata.description,
      'og:url': currentUrl,
      'og:image': pageImage,
      'og:type': metadata.type,
      'og:site_name': 'Find My Wedding Vendor'
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Set Twitter Card meta tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': metadata.title,
      'twitter:description': metadata.description,
      'twitter:image': pageImage,
      'twitter:site': '@findmyweddingvendor'
    };
    
    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Add geo meta tags if location is provided
    if (city && state) {
      const geoTags = {
        'geo.region': `US-${state}`,
        'geo.placename': city,
        'geo.position': '', // Would be great to add lat/long if available
        'ICBM': '' // Would be great to add lat/long if available
      };
      
      Object.entries(geoTags).forEach(([name, content]) => {
        if (!content) return; // Skip empty values
        
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      });
      
      // Add location to title tag for better local SEO
      document.title = `${metadata.title} | ${city}, ${state}`;
    }
    
    // Add additional meta tags for better indexing
    const additionalTags = {
      'robots': 'index, follow',
      'revisit-after': '7 days',
      'author': 'Find My Wedding Vendor',
      'viewport': 'width=device-width, initial-scale=1.0'
    };
    
    Object.entries(additionalTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
  }, [category, city, state, isHomePage, totalVendors, subcategory, imageUrl, canonicalUrl]);

  return null;
};
