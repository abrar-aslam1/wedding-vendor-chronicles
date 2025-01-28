import { Phone, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-start text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-wedding-primary/70" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}
      
      {url && (
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary/70" />
          <Button
            variant="link"
            className="h-auto p-0 text-sm text-wedding-primary hover:text-wedding-accent truncate"
            onClick={() => window.open(url, '_blank')}
          >
            Visit Website
          </Button>
        </div>
      )}
    </div>
  );
};