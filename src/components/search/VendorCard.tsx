import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Mail, Instagram, Facebook, Twitter } from "lucide-react";
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
      className="relative w-[280px] h-[280px] bg-white rounded-[32px] p-[3px] shadow-lg transition-all duration-500 ease-in-out hover:rounded-tl-[55px] group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Mail Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-8 top-6 z-10"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `mailto:${vendor.email}`;
        }}
      >
        <Mail className="h-6 w-6 stroke-wedding-primary hover:stroke-wedding-accent stroke-[3px]" />
      </Button>

      {/* Profile Image */}
      <div className="absolute inset-[3px] rounded-[29px] overflow-hidden z-[1] border-0 border-wedding-primary transition-all duration-500 ease-in-out delay-200 group-hover:w-[100px] group-hover:h-[100px] group-hover:top-[10px] group-hover:left-[10px] group-hover:rounded-full group-hover:z-[3] group-hover:border-[7px] group-hover:shadow-md">
        <img
          src={vendor.main_image || '/placeholder.svg'}
          alt={vendor.title}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-[2.5] group-hover:object-top"
        />
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-[3px] left-[3px] right-[3px] bg-wedding-primary top-[80%] rounded-[29px] z-[2] shadow-inner overflow-hidden transition-all duration-500 ease-in-out group-hover:top-[20%] group-hover:rounded-[80px_29px_29px_29px]">
        <div className="absolute bottom-0 left-6 right-6 h-40">
          <span className="block text-xl text-white font-bold truncate">
            {vendor.title}
          </span>

          {vendor.rating && vendor.rating.value && (
            <RatingDisplay rating={vendor.rating} className="mt-2" />
          )}

          <span className="block text-sm text-white mt-4 line-clamp-2">
            {vendor.snippet || "No description available"}
          </span>

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between">
            <div className="flex gap-4">
              {vendor.instagram && (
                <Instagram 
                  className="h-5 w-5 fill-white hover:fill-wedding-accent cursor-pointer transition-transform hover:scale-110" 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://instagram.com/${vendor.instagram.replace('@', '')}`, '_blank');
                  }}
                />
              )}
              {vendor.facebook && (
                <Facebook 
                  className="h-5 w-5 fill-white hover:fill-wedding-accent cursor-pointer transition-transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(vendor.facebook, '_blank');
                  }}
                />
              )}
              {vendor.twitter && (
                <Twitter 
                  className="h-5 w-5 fill-white hover:fill-wedding-accent cursor-pointer transition-transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(vendor.twitter, '_blank');
                  }}
                />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`${isFavorite ? 'text-red-500' : 'text-white'} hover:text-red-500 flex items-center justify-center`}
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
        </div>
      </div>
    </Card>
  );
};