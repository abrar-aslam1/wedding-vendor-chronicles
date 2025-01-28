import { Button } from "@/components/ui/button";
import { MapPin, Globe, Phone } from "lucide-react";

interface VendorContactInfoProps {
  phone?: string;
  address?: string;
  url?: string;
}

export const VendorContactInfo = ({ phone, address, url }: VendorContactInfoProps) => {
  return (
    <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
      {phone && (
        <div className="flex items-center text-sm text-gray-500">
          <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary/70" />
          <a href={`tel:${phone}`} className="hover:text-wedding-primary transition-colors truncate">
            {phone}
          </a>
        </div>
      )}
      
      {address && (
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary/70" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}
      
      {url && (
        <Button
          variant="outline"
          className="w-full text-sm bg-white hover:bg-wedding-primary hover:text-white border-wedding-primary/20 text-wedding-primary transition-all duration-200"
          onClick={() => window.open(url, '_blank')}
        >
          <Globe className="h-4 w-4 mr-2" />
          Visit Website
        </Button>
      )}
    </div>
  );
};