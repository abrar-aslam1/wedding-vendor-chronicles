import { MainNav } from "@/components/MainNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { SearchResults } from "@/components/search/SearchResults";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const [favorites, setFavorites] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to view your favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vendor_favorites')
        .select('vendor_data');

      if (error) throw error;

      const transformedFavorites: SearchResult[] = data?.map(item => {
        const vendorData = item.vendor_data as Record<string, any>;
        return {
          title: vendorData.title || '',
          description: vendorData.description || '',
          snippet: vendorData.snippet || vendorData.description || '',
          rating: vendorData.rating ? {
            value: vendorData.rating.value || 0,
            votes_count: vendorData.rating.votes_count || 0,
            // Ensure count property exists for RatingDisplay component
            count: vendorData.rating.votes_count || 0
          } : undefined,
          phone: vendorData.phone || '',
          address: vendorData.address || '',
          url: vendorData.url || '',
          place_id: vendorData.place_id || '',
          main_image: vendorData.main_image || '',
          images: vendorData.images || [],
          // Add social media properties with fallbacks
          instagram: vendorData.instagram || '',
          facebook: vendorData.facebook || '',
          twitter: vendorData.twitter || ''
        };
      }) || [];

      setFavorites(transformedFavorites);
    } catch (error: any) {
      toast({
        title: "Error loading favorites",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-wedding-primary mb-8">My Favorite Vendors</h1>
        <SearchResults results={favorites} isSearching={isLoading} />
      </div>
    </div>
  );
};

export default Favorites;
