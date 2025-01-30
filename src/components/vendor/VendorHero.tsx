import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorContactInfo } from "@/components/search/VendorContactInfo";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/search";

interface VendorHeroProps {
  vendor: Vendor;
  handleFavoriteClick: () => void;
  isFavorited: boolean;
}

export const VendorHero = ({ vendor, handleFavoriteClick, isFavorited }: VendorHeroProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-heading font-semibold text-wedding-text mb-2">
            {vendor.business_name}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-wedding-text">
                {vendor.rating} ({vendor.reviews_count} reviews)
              </span>
            </div>
            <Badge variant="secondary">{vendor.category}</Badge>
          </div>
          <p className="text-wedding-text mb-4">{vendor.description}</p>
          <VendorContactInfo vendor={vendor} />
        </div>
        <div className="w-full md:w-auto">
          <Button
            onClick={handleFavoriteClick}
            variant={isFavorited ? "default" : "outline"}
            className={isFavorited ? "bg-wedding-primary hover:bg-wedding-accent" : "border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white"}
          >
            {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          </Button>
        </div>
      </div>
    </div>
  );
};