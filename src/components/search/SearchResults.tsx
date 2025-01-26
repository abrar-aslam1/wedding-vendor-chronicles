import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe, Phone } from "lucide-react";

interface SearchResult {
  title: string;
  description: string;
  rating?: {
    rating_value?: number;
    rating_count?: number;
  };
  phone?: string;
  address?: string;
  url?: string;
  place_id?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
}

export const SearchResults = ({ results, isSearching }: SearchResultsProps) => {
  if (results.length === 0 && !isSearching) {
    return (
      <div className="mt-4 md:mt-8 text-center text-gray-500">
        No vendors found. Try adjusting your search criteria.
      </div>
    );
  }

  const renderRating = (rating: SearchResult['rating']) => {
    if (!rating?.rating_value) return null;

    const stars = [];
    const ratingValue = Math.round(rating.rating_value * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === ratingValue) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-yellow-400" />
            <Star className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">
          {rating.rating_count ? `(${rating.rating_count})` : ''}
        </span>
      </div>
    );
  };

  return (
    <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {results.map((vendor, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
          <CardContent className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-lg font-semibold text-wedding-primary line-clamp-2">
                {vendor.title}
              </h3>
              {vendor.rating && renderRating(vendor.rating)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {vendor.description}
            </p>
            
            <div className="space-y-2 mt-auto">
              {vendor.phone && (
                <div className="flex items-center text-xs text-gray-500">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-wedding-primary transition-colors truncate">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{vendor.address}</span>
                </div>
              )}
              
              {vendor.url && (
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm hover:bg-wedding-primary hover:text-white transition-colors"
                  onClick={() => window.open(vendor.url, '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};