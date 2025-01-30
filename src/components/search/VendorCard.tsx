import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
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
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-white border-gray-100 hover:border-wedding-primary/20 cursor-pointer"
      onClick={handleCardClick}
    >
      {vendor.main_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={vendor.main_image}
            alt={vendor.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-4 flex flex-col h-[calc(100%-12rem)]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-wedding-text line-clamp-2">
            {vendor.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className={`${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 flex items-center justify-center`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
            style={{ display: 'inline-flex' }}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
              aria-hidden="true"
              focusable="false"
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
      </CardContent>
    </Card>
  );
};