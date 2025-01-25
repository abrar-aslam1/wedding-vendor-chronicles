import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe } from "lucide-react";

interface SearchResult {
  title: string;
  description: string;
  rating?: {
    rating_value?: number;
    rating_count?: number;
  };
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
      <div className="mt-8 text-center text-gray-500">
        No vendors found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6">
      {results.map((vendor, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-wedding-primary">{vendor.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
            <div className="space-y-2">
              {vendor.rating?.rating_value && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>{vendor.rating.rating_value} stars</span>
                  {vendor.rating.rating_count && (
                    <span className="ml-1">({vendor.rating.rating_count} reviews)</span>
                  )}
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {vendor.address}
                </div>
              )}
            </div>
            {vendor.url && (
              <Button
                variant="outline"
                className="mt-4"
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