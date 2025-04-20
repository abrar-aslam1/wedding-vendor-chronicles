import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface SearchHeaderProps {
  subcategory?: string;
}

export const SearchHeader = ({ subcategory }: SearchHeaderProps) => {
  const { category, city, state } = useParams();
  const [vendorType, setVendorType] = useState<string>('vendors');
  const [singularVendorType, setSingularVendorType] = useState<string>('vendor');
  
  const cleanCategory = category?.replace('top-20/', '').replace(/-/g, ' ');
  const displayLocation = city && state ? ` in ${city}, ${state}` : '';
  
  // Format subcategory for display with proper capitalization
  const formattedSubcategory = subcategory 
    ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) 
    : '';
    
  useEffect(() => {
    if (cleanCategory) {
      setVendorType(cleanCategory);
      
      // Set singular form
      const type = cleanCategory.toLowerCase();
      if (type === 'caterers') setSingularVendorType('caterer');
      else if (type === 'photographers') setSingularVendorType('photographer');
      else if (type === 'videographers') setSingularVendorType('videographer');
      else if (type === 'florists') setSingularVendorType('florist');
      else if (type === 'venues') setSingularVendorType('venue');
      else if (type === 'djs & bands') setSingularVendorType('entertainment provider');
      else if (type === 'cake designers') setSingularVendorType('cake designer');
      else if (type === 'bridal shops') setSingularVendorType('bridal shop');
      else if (type === 'makeup artists') setSingularVendorType('makeup artist');
      else if (type === 'hair stylists') setSingularVendorType('hair stylist');
      else setSingularVendorType(type.endsWith('s') ? type.slice(0, -1) : type);
    }
  }, [cleanCategory]);
  
  // Get appropriate subcategory description based on vendor type
  const getSubcategoryDescription = () => {
    const type = vendorType.toLowerCase();
    if (type === 'caterers') return `${formattedSubcategory} Cuisine`;
    if (type === 'wedding planners') return `${formattedSubcategory}`;
    if (type === 'photographers') return `${formattedSubcategory} Style`;
    if (type === 'florists') return `${formattedSubcategory} Style`;
    if (type === 'venues') return `${formattedSubcategory} Venues`;
    if (type === 'djs & bands') return `${formattedSubcategory}`;
    return formattedSubcategory;
  };
  
  // Get appropriate title based on vendor type and subcategory
  const getTitle = () => {
    if (!subcategory) return `Top 20 ${cleanCategory}${displayLocation}`;
    
    const type = vendorType.toLowerCase();
    if (type === 'caterers') return `${formattedSubcategory} Cuisine ${cleanCategory}${displayLocation}`;
    if (type === 'wedding planners') return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
    if (type === 'photographers') return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
    if (type === 'florists') return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
    if (type === 'venues') return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
    if (type === 'djs & bands') return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
    return `${formattedSubcategory} ${cleanCategory}${displayLocation}`;
  };
  
  // Get appropriate subtitle based on vendor type and subcategory
  const getSubtitle = () => {
    if (!subcategory) return "Find the best wedding vendors in your area";
    
    const type = vendorType.toLowerCase();
    if (type === 'caterers') return `Find the best ${formattedSubcategory.toLowerCase()} cuisine caterers for your wedding`;
    return `Find the best ${getSubcategoryDescription().toLowerCase()} ${singularVendorType}s for your wedding`;
  };
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-wedding-text capitalize">
        {getTitle()}
      </h1>
      <p className="text-gray-600 mt-2">
        {getSubtitle()}
      </p>
    </div>
  );
};
