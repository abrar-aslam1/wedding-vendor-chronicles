import { useEffect } from 'react';
import { getTitle, getMeta, getKeywords, getCanonicalUrl, getOGImageUrl, validateTitleLength, validateMetaLength } from '@/utils/seo-helpers';

interface SEOHeadProps {
  category?: string;
  city?: string;
  state?: string;
  isHomePage?: boolean;
  totalVendors?: number;
  subcategory?: string;
  imageUrl?: string;
  canonicalUrl?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  vendorName?: string;
  tags?: string[];
  priceRange?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  category,
  city,
  state,
  isHomePage = false,
  totalVendors,
  subcategory,
  imageUrl,
  canonicalUrl,
  customTitle,
  customDescription,
  customKeywords,
  noIndex = false,
  publishedTime,
  modifiedTime,
  articleAuthor,
  articleSection,
  vendorName,
  tags,
  priceRange
}) => {
  useEffect(() => {
    const generateMetadata = () => {
      // Use custom values if provided
      if (customTitle && customDescription) {
        return {
          title: customTitle,
          description: customDescription,
          keywords: customKeywords || 'wedding vendors, wedding services, wedding planning',
          type: articleSection ? 'article' : 'website'
        };
      }

      // Use SEO helper functions for consistent title and meta generation
      const seoParams = {
        category,
        city,
        state,
        subcategory,
        vendorName,
        tags,
        priceRange
      };

      // Generate title and description based on available information
      if (isHomePage) {
        return {
          title: 'Find My Wedding Vendor | Top Wedding Services Directory',
          description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find photographers, venues, caterers, florists, and more for your perfect wedding day.',
          keywords: 'wedding vendors, wedding services, wedding planning, wedding directory, wedding photographers, wedding venues, wedding caterers, wedding florists, find wedding vendors',
          type: 'website'
        };
      }

      const title = getTitle(seoParams);
      const description = getMeta(seoParams);
      const keywords = getKeywords(seoParams);

      // Validate title and description lengths
      if (!validateTitleLength(title)) {
        console.warn(`SEO Warning: Title exceeds 60 characters: "${title}" (${title.length} chars)`);
      }
      
      if (!validateMetaLength(description)) {
        console.warn(`SEO Warning: Meta description exceeds 160 characters: "${description}" (${description.length} chars)`);
      }

      return {
        title,
        description,
        keywords,
        type: vendorName ? 'business.business' : 'website'
      };
    };

    const metadata = generateMetadata();
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://findmyweddingvendor.com';
    
    // Use helper function for canonical URL if not provided
    const currentUrl = canonicalUrl || getCanonicalUrl({
      category,
      city,
      state,
      subcategory,
      vendorName
    });
    
    // Use helper function for OG image
    const pageImage = imageUrl || getOGImageUrl({
      category,
      city,
      state,
      vendorName
    });
    
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
    
    // Add article-specific meta tags if this is an article
    if (articleSection || publishedTime || modifiedTime || articleAuthor) {
      const articleTags = {
        ...(publishedTime && { 'article:published_time': publishedTime }),
        ...(modifiedTime && { 'article:modified_time': modifiedTime }),
        ...(articleAuthor && { 'article:author': articleAuthor }),
        ...(articleSection && { 'article:section': articleSection })
      };
      
      Object.entries(articleTags).forEach(([property, content]) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      });
    }
    
    // Add additional meta tags for better indexing
    const additionalTags = {
      'robots': noIndex ? 'noindex, nofollow' : 'index, follow',
      'revisit-after': '7 days',
      'author': articleAuthor || 'Find My Wedding Vendor',
      'viewport': 'width=device-width, initial-scale=1.0',
      'language': 'en-US',
      'distribution': 'global',
      'rating': 'general'
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
    
  }, [category, city, state, isHomePage, totalVendors, subcategory, imageUrl, canonicalUrl, customTitle, customDescription, customKeywords, noIndex, publishedTime, modifiedTime, articleAuthor, articleSection]);

  return null;
};
