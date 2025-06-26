import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Instagram, Users, CheckCircle } from "lucide-react";
import { SearchResult } from "@/types/search";
import { VendorContactInfo } from "./VendorContactInfo";
import { RatingDisplay } from "./RatingDisplay";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VendorCardProps {
  vendor: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onToggleFavorite: (vendor: SearchResult) => void;
  subcategory?: string;
}

export const VendorCard = ({ 
  vendor, 
  isFavorite, 
  isLoading, 
  onToggleFavorite,
  subcategory
}: VendorCardProps) => {
  const navigate = useNavigate();
  
  // Get appropriate subcategory label based on vendor type and URL
  const getSubcategoryLabel = (subcategory: string) => {
    // Format subcategory for display with proper capitalization
    const formattedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
    
    // Check if we're on the Favorites page
    const path = window.location.pathname;
    if (path === '/favorites') {
      // On Favorites page, just return the formatted subcategory
      return formattedSubcategory;
    }
    
    // Extract vendor type from URL for category pages
    const matches = path.match(/\/top-20\/([^\/]+)/);
    
    if (matches && matches[1]) {
      const vendorTypeSlug = matches[1];
      
      // Return appropriate label based on vendor type
      if (vendorTypeSlug === 'caterers') return `${formattedSubcategory} Cuisine`;
      if (vendorTypeSlug === 'photographers') return `${formattedSubcategory} Style`;
      if (vendorTypeSlug === 'florists') return `${formattedSubcategory} Style`;
      if (vendorTypeSlug === 'venues') return `${formattedSubcategory}`;
      if (vendorTypeSlug === 'djs-and-bands') return `${formattedSubcategory}`;
      if (vendorTypeSlug === 'wedding-planners') return `${formattedSubcategory}`;
    }
    
    // Default fallback
    return formattedSubcategory;
  };

  const handleCardClick = () => {
    navigate(`/vendor/${encodeURIComponent(vendor.place_id)}`, { state: { vendor } });
  };

  const handleFavoriteClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }
    
    onToggleFavorite(vendor);
  };

  return (
    <div className="relative flex w-full flex-col rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative mx-4 -mt-6 h-48 overflow-hidden rounded-xl shadow-lg">
        {/* Instagram Badge */}
        {vendor.vendor_source === 'instagram' && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md z-10 flex items-center gap-1">
            <Instagram className="h-3 w-3" />
            <span>Instagram</span>
          </div>
        )}
        
        {subcategory && (
          <div className={`absolute top-2 ${vendor.vendor_source === 'instagram' ? 'right-2' : 'right-2'} bg-wedding-primary text-white px-3 py-1 rounded-full text-xs font-medium shadow-md z-10`}>
            {getSubcategoryLabel(subcategory)}
          </div>
        )}
        {vendor.main_image ? (
          <img
            src={vendor.main_image}
            alt={vendor.title || 'Vendor image'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-wedding-primary to-wedding-secondary">
            <span className="text-2xl font-semibold text-white">
              {vendor.title && vendor.title.length > 0 ? vendor.title[0] : '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-wedding-text line-clamp-2 mb-2">
          {vendor.title}
        </h3>

        {vendor.rating && (
          <RatingDisplay rating={vendor.rating} className="mb-2" />
        )}

        {/* Instagram-specific info */}
        {vendor.vendor_source === 'instagram' && (
          <div className="flex items-center gap-3 mb-3">
            {vendor.instagram_handle && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Instagram className="h-4 w-4" />
                <span>@{vendor.instagram_handle}</span>
              </div>
            )}
            {vendor.follower_count && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{vendor.follower_count.toLocaleString()} followers</span>
              </div>
            )}
            {vendor.is_verified && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <CheckCircle className="h-4 w-4 fill-current" />
                <span>Verified</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {vendor.snippet || "No description available"}
        </p>

        <VendorContactInfo 
          phone={vendor.phone}
          address={vendor.address}
          url={vendor.url}
          instagram={vendor.instagram_handle || vendor.instagram}
          facebook={vendor.facebook}
          twitter={vendor.twitter}
        />
      </div>

      {/* Favorite Button Section */}
      <div className="px-6 pb-3">
        <input 
          type="checkbox" 
          id={`favorite-${vendor.place_id}`}
          checked={isFavorite}
          onChange={handleFavoriteClick}
          className="peer hidden" 
          disabled={isLoading}
        />
        <label 
          htmlFor={`favorite-${vendor.place_id}`}
          className="flex w-full items-center justify-center gap-3.5 px-4 py-2.5 rounded-lg cursor-pointer select-none bg-white shadow-[rgba(149,157,165,0.2)_0px_8px_24px] text-wedding-text hover:bg-gray-50"
        >
          <Heart 
            className={`h-6 w-6 transition-all duration-500 ${
              isFavorite ? 'fill-wedding-primary stroke-wedding-primary animate-[heartBeat_1s_ease-in-out]' : 'stroke-current'
            }`}
            aria-hidden="true"
          />
          <div className="relative overflow-hidden grid">
            <span className={`col-start-1 col-end-1 row-start-1 row-end-1 transition-all duration-500 ${
              isFavorite ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              Add to Favorites
            </span>
            <span className={`col-start-1 col-end-1 row-start-1 row-end-1 transition-all duration-500 ${
              isFavorite ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0'
            }`}>
              Added to Favorites
            </span>
          </div>
        </label>
      </div>

      {/* Action Section */}
      <div className="p-6 pt-0 mt-auto">
        <button
          onClick={handleCardClick}
          className="group relative inline-block w-full cursor-pointer outline-none border-0 bg-transparent p-0 text-base font-inherit"
        >
          <span className="absolute top-0 left-0 h-12 w-12 rounded-full bg-wedding-primary transition-all duration-450 ease-out group-hover:w-full group-hover:shadow-lg group-active:scale-95">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-0.5">
              <span className="absolute right-0.5 -top-1 h-2.5 w-2.5 rotate-45 border-t-2 border-r-2 border-white"></span>
            </span>
          </span>
          <span className="relative block py-3 px-0 text-center font-bold uppercase tracking-wider text-wedding-text/50 transition-all duration-450 ease-out group-hover:translate-x-0 group-hover:text-white">
            View Details
          </span>
        </button>
      </div>
    </div>
  );
};
