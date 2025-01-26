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

      // Transform the data to ensure it matches SearchResult type
      const transformedFavorites: SearchResult[] = data?.map(item => ({
        title: item.vendor_data.title,
        description: item.vendor_data.description,
        rating: item.vendor_data.rating,
        phone: item.vendor_data.phone,
        address: item.vendor_data.address,
        url: item.vendor_data.url,
        place_id: item.vendor_data.place_id
      })) || [];

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