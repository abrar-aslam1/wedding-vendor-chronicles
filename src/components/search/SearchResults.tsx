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

  return (
    <div className="mt-4 md:mt-8 grid gap-4 md:gap-6">
      {results.map((vendor, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg md:text-xl font-semibold text-wedding-primary">{vendor.title}</h3>
              {vendor.rating?.rating_value && (
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-yellow-700">
                    {vendor.rating.rating_value}
                    {vendor.rating.rating_count && (
                      <span className="text-yellow-600 ml-1">
                        ({vendor.rating.rating_count})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
            
            <div className="space-y-2">
              {vendor.phone && (
                <div className="flex items-center text-xs md:text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-wedding-primary transition-colors">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-xs md:text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{vendor.address}</span>
                </div>
              )}
            </div>
            
            {vendor.url && (
              <Button
                variant="outline"
                className="mt-4 w-full md:w-auto text-sm hover:bg-wedding-primary hover:text-white transition-colors"
                onClick={() => window.open(vendor.url, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};