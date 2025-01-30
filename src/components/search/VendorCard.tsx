import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Mail } from "lucide-react";
import { SearchResult } from "@/types/search";
import { VendorContactInfo } from "./VendorContactInfo";
import { RatingDisplay } from "./RatingDisplay";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vendor/${encodeURIComponent(vendor.place_id)}`, { state: { vendor } });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(vendor);
  };

  return (
    <div className="relative flex w-full flex-col rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative mx-4 -mt-6 h-48 overflow-hidden rounded-xl shadow-lg">
        {vendor.main_image ? (
          <img
            src={vendor.main_image}
            alt={vendor.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-wedding-primary to-wedding-secondary">
            <span className="text-2xl font-semibold text-white">{vendor.title[0]}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-wedding-text line-clamp-2">
            {vendor.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className={`${isFavorite ? 'text-wedding-primary' : 'text-gray-400'} hover:text-wedding-primary`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span className="sr-only">
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </span>
          </Button>
        </div>

        {vendor.rating && vendor.rating.value && (
          <RatingDisplay rating={vendor.rating} className="mb-2" />
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {vendor.snippet || "No description available"}
        </p>

        <VendorContactInfo 
          phone={vendor.phone}
          address={vendor.address}
          url={vendor.url}
          instagram={vendor.instagram}
          facebook={vendor.facebook}
          twitter={vendor.twitter}
        />
      </div>

      {/* Action Section */}
      <div className="p-6 pt-0 mt-auto">
        <Button
          onClick={handleCardClick}
          className="w-full bg-wedding-primary text-white hover:bg-wedding-accent shadow-md hover:shadow-lg transition-all duration-300"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};