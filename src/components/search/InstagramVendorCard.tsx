import { useState } from "react";
import { Heart, Instagram, MapPin, Phone, Globe, Users, CheckCircle, Camera, Award, Star } from "lucide-react";
import { SearchResult } from "@/types/search";
import { Button } from "@/components/ui/button";

interface InstagramVendorCardProps {
  vendor: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onToggleFavorite: (vendor: SearchResult) => void;
  subcategory?: string;
}

export const InstagramVendorCard = ({ 
  vendor, 
  isFavorite, 
  isLoading, 
  onToggleFavorite,
  subcategory 
}: InstagramVendorCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatFollowerCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 relative">
      {/* Instagram Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Instagram className="h-3 w-3" />
          Instagram
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(vendor)}
        disabled={isLoading}
        className="absolute top-3 left-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors duration-200"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={`h-4 w-4 transition-colors duration-200 ${
            isFavorite 
              ? "fill-red-500 text-red-500" 
              : "text-gray-600 hover:text-red-500"
          } ${isLoading ? "animate-pulse" : ""}`}
        />
      </button>

      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {vendor.main_image && !imageError ? (
          <img
            src={vendor.main_image}
            alt={vendor.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
            <Instagram className="h-12 w-12 text-pink-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Verification */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-wedding-text line-clamp-2 flex-1">
            {vendor.title}
          </h3>
          {vendor.is_verified && (
            <CheckCircle className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0" />
          )}
        </div>

        {/* Instagram Handle */}
        {vendor.instagram_handle && (
          <div className="flex items-center gap-1 mb-2">
            <Instagram className="h-4 w-4 text-pink-500" />
            <span className="text-sm text-pink-600 font-medium">
              @{vendor.instagram_handle}
            </span>
          </div>
        )}

        {/* Enhanced Stats with Visual Appeal */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {vendor.follower_count && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {formatFollowerCount(vendor.follower_count)}
              </div>
              <div className="text-xs text-gray-500">followers</div>
            </div>
          )}
          {vendor.post_count && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Camera className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {vendor.post_count}
              </div>
              <div className="text-xs text-gray-500">posts</div>
            </div>
          )}
        </div>

        {/* Account Type Badge */}
        {vendor.is_business_account && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <Award className="h-3 w-3" />
              Business Account
            </div>
            {vendor.is_verified && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
        )}

        {/* Bio/Description with Enhanced Styling */}
        {vendor.bio && (
          <div className="mb-3">
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-pink-400">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                {vendor.bio}
              </p>
            </div>
          </div>
        )}

        {/* Instagram Advantage Badge */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 mb-3 border border-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700">Instagram Advantage</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Visual portfolio showcase • Real wedding photos • Client testimonials • Behind-the-scenes content
          </p>
        </div>

        {/* Location */}
        {vendor.address && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2">
              {vendor.address}
            </span>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors duration-200"
            >
              <Phone className="h-3 w-3" />
              Call
            </a>
          )}
          {vendor.url && (
            <a
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors duration-200"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
        </div>

        {/* View Profile Button */}
        <Button 
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          onClick={() => {
            if (vendor.instagram_handle) {
              window.open(`https://instagram.com/${vendor.instagram_handle}`, '_blank');
            }
          }}
        >
          <Instagram className="h-4 w-4 mr-2" />
          View Instagram Profile
        </Button>
      </div>
    </div>
  );
};
