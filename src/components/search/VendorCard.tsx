import { Card } from "@/components/ui/card";
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
          <div className="relative">
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
              className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg cursor-pointer select-none bg-white shadow-[rgba(149,157,165,0.2)_0px_8px_24px] text-wedding-text"
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