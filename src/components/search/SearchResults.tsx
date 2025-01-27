import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { VendorCard } from "./VendorCard";

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
        <VendorCard
          key={index}
          vendor={vendor}
          isFavorite={favorites.has(vendor.place_id || '')}
          isLoading={loading.has(vendor.place_id || '')}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
};