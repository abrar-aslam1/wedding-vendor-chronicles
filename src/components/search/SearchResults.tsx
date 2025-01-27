import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe, Phone, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchResult, Rating } from "@/types/search";

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
}

export const SearchResults = ({ results, isSearching }: SearchResultsProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    console.log('Search Results:', results);
    fetchFavorites();
  }, [results]);

  const fetchFavorites = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: favoritesData } = await supabase
      .from('vendor_favorites')
      .select('vendor_id');

    if (favoritesData) {
      setFavorites(new Set(favoritesData.map(f => f.vendor_id)));
    }
  };

  const toggleFavorite = async (vendor: SearchResult) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to favorite vendors",
        variant: "destructive",
      });
      return;
    }

    if (!vendor.place_id) return;

    setLoading(prev => new Set([...prev, vendor.place_id!]));

    try {
      if (favorites.has(vendor.place_id)) {
        // Remove favorite
        await supabase
          .from('vendor_favorites')
          .delete()
          .eq('vendor_id', vendor.place_id)
          .eq('user_id', session.session.user.id);

        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(vendor.place_id!);
          return next;
        });

        toast({
          title: "Removed from favorites",
          description: "Vendor has been removed from your favorites",
        });
      } else {
        // Add favorite
        const vendorData = {
          ...vendor,
          rating: vendor.rating ? {
            value: vendor.rating.value,
            votes_count: vendor.rating.votes_count
          } : null
        };

        await supabase
          .from('vendor_favorites')
          .insert({
            user_id: session.session.user.id,
            vendor_id: vendor.place_id,
            vendor_data: vendorData,
          });

        setFavorites(prev => new Set([...prev, vendor.place_id!]));

        toast({
          title: "Added to favorites",
          description: "Vendor has been added to your favorites",
        });
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => {
        const next = new Set(prev);
        next.delete(vendor.place_id!);
        return next;
      });
    }
  };

  const renderRating = (rating: SearchResult['rating']) => {
    console.log('Rating data for vendor:', rating);
    
    if (!rating?.value) {
      return (
        <div className="text-sm text-gray-500">
          No ratings available
        </div>
      );
    }

    const stars = [];
    const ratingValue = Math.round(rating.value * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === ratingValue) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="h-4 w-4 text-yellow-400" />
            <Star className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <div className="flex">{stars}</div>
          <span className="ml-1 font-medium text-wedding-primary">
            {rating.value.toFixed(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {rating.votes_count 
            ? <span>{rating.votes_count.toLocaleString()} reviews</span>
            : 'No reviews yet'}
        </div>
      </div>
    );
  };

  if (results.length === 0 && !isSearching) {
    return (
      <div className="mt-4 md:mt-8 text-center text-gray-500">
        No vendors found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((vendor, index) => (
        <Card 
          key={index} 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-white border-gray-100 hover:border-wedding-primary/20"
        >
          <CardContent className="p-5 md:p-6 flex flex-col h-full">
            <div className="flex justify-between items-start gap-3 mb-4">
              <h3 className="text-lg font-semibold text-wedding-primary hover:text-wedding-accent transition-colors duration-200 line-clamp-2">
                {vendor.title}
              </h3>
              <button
                onClick={() => toggleFavorite(vendor)}
                disabled={loading.has(vendor.place_id || '')}
                className="text-wedding-primary hover:scale-110 transition-transform disabled:opacity-50 p-1"
              >
                <Heart 
                  className={`h-5 w-5 ${favorites.has(vendor.place_id || '') ? 'fill-wedding-primary' : ''}`}
                />
              </button>
            </div>
            
            {vendor.rating && renderRating(vendor.rating)}
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {vendor.description}
            </p>
            
            <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
              {vendor.phone && (
                <div className="flex items-center text-sm text-gray-500 hover:text-wedding-primary transition-colors">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary/70" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-wedding-primary transition-colors truncate">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-wedding-primary/70" />
                  <span className="line-clamp-1">{vendor.address}</span>
                </div>
              )}
              
              {vendor.url && (
                <Button
                  variant="outline"
                  className="mt-4 w-full text-sm bg-white hover:bg-wedding-primary hover:text-white border-wedding-primary/20 text-wedding-primary transition-all duration-200"
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
