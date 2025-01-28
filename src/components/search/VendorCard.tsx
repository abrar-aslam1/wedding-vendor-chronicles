import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe, Phone, Heart } from "lucide-react";
import { SearchResult } from "@/types/search";
import { RatingDisplay } from "./RatingDisplay";
import { VendorContactInfo } from "./VendorContactInfo";

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
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-white border-gray-100 hover:border-wedding-primary/20"
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
      <CardContent className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-3 mb-4">
          <h3 className="text-lg font-semibold text-wedding-primary hover:text-wedding-accent transition-colors duration-200 line-clamp-2">
            {vendor.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(vendor)}
            disabled={isLoading}
            className="text-wedding-primary hover:scale-110 transition-transform disabled:opacity-50 p-1"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-wedding-primary' : ''}`}
            />
          </button>
        </div>
        
        <RatingDisplay rating={vendor.rating} />
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {vendor.description}
        </p>
        
        <VendorContactInfo 
          phone={vendor.phone}
          address={vendor.address}
          url={vendor.url}
        />
      </CardContent>
    </Card>
  );
};