import { Phone, MapPin, Globe, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorContactInfoProps {
  phone?: string;
  address?: string;
  url?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export const VendorContactInfo = ({ 
  phone, 
  address, 
  url,
  instagram,
  facebook,
  twitter 
}: VendorContactInfoProps) => {
  return (
    <div className="space-y-2">
      {phone && (
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary" />
          <a href={`tel:${phone}`} className="hover:text-wedding-primary transition-colors truncate">
            {phone}
          </a>
        </div>
      )}
      
      {address && (
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-wedding-primary" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}
      
      {url && (
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary" />
          <Button
            variant="link"
            className="h-auto p-0 text-sm text-wedding-primary hover:text-wedding-accent"
            onClick={() => window.open(url, '_blank')}
          >
            Visit Website
          </Button>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        {instagram && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-wedding-primary hover:text-wedding-accent"
            onClick={() => window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank')}
          >
            <Instagram className="h-4 w-4" />
          </Button>
        )}

        {facebook && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-wedding-primary hover:text-wedding-accent"
            onClick={() => window.open(facebook, '_blank')}
          >
            <Facebook className="h-4 w-4" />
          </Button>
        )}

        {twitter && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-wedding-primary hover:text-wedding-accent"
            onClick={() => window.open(twitter, '_blank')}
          >
            <Twitter className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};