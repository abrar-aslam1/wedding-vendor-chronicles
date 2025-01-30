import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Mail } from "lucide-react";
import { SearchResult } from "@/types/search";
import { RatingDisplay } from "./RatingDisplay";

interface VendorCardProps {
  vendor: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onToggleFavorite: (vendor: SearchResult) => void;
}

export const VendorCard = ({ 
  vendor, 
  isFavorite, 
  isLoading, 
  onToggleFavorite 
}: VendorCardProps) => {
  const handleCardClick = () => {
    window.open(`/vendor/${encodeURIComponent(vendor.place_id)}`, '_blank');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(vendor);
  };

  return (
    <Card 
      className="relative w-[280px] h-[280px] bg-white rounded-[32px] p-4 shadow-lg cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Title and Rating */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            {vendor.title}
          </h3>
          {vendor.rating && vendor.rating.value && (
            <RatingDisplay rating={vendor.rating} className="mt-1" />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {vendor.snippet || "No description available"}
        </p>

        {/* Address */}
        {vendor.address && (
          <p className="text-sm text-gray-500 mb-2 truncate">
            {vendor.address}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-wedding-primary"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${vendor.email}`;
            }}
          >
            <Mail className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </Card>
  );
};