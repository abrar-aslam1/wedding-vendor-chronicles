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
      console.log('Fetching favorites for user:', session.session.user.id);
      
      const { data, error } = await supabase
        .from('vendor_favorites')
        .select('vendor_data')
        .eq('user_id', session.session.user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }

      console.log('Favorites data:', data);

      // Safely transform vendor data with proper type checking and fallbacks
      const transformedFavorites: SearchResult[] = data?.map(item => {
        // Ensure vendor_data exists and is an object
        if (!item.vendor_data || typeof item.vendor_data !== 'object') {
          console.error('Invalid vendor_data format:', item.vendor_data);
          return null;
        }

        const vendorData = item.vendor_data as Record<string, any>;
        
        // Log the structure of vendorData for debugging
        console.log('Processing vendor data:', vendorData);
        
        // Create a properly structured rating object
        let ratingObject = {
          value: 0,
          votes_count: 0,
          count: 0
        };
        
        // Carefully extract rating information if it exists
        if (vendorData.rating) {
          try {
            const ratingValue = parseFloat(vendorData.rating.value) || 0;
            const votesCount = parseInt(vendorData.rating.votes_count || 0, 10);
            
            ratingObject = {
              value: isNaN(ratingValue) ? 0 : ratingValue,
              votes_count: isNaN(votesCount) ? 0 : votesCount,
              count: isNaN(votesCount) ? 0 : votesCount // Ensure count exists for RatingDisplay
            };
          } catch (error) {
            console.error('Error parsing rating data:', error);
          }
        }
        
        return {
          title: vendorData.title || '',
          description: vendorData.description || '',
          snippet: vendorData.snippet || vendorData.description || '',
          rating: ratingObject,
          phone: vendorData.phone || '',
          address: vendorData.address || '',
          url: vendorData.url || '',
          place_id: vendorData.place_id || '',
          main_image: vendorData.main_image || '',
          images: Array.isArray(vendorData.images) ? vendorData.images : [],
          // Add social media properties with fallbacks
          instagram: vendorData.instagram || '',
          facebook: vendorData.facebook || '',
          twitter: vendorData.twitter || ''
        };
      }).filter(Boolean) as SearchResult[] || []; // Filter out any null values
      
      console.log('Transformed favorites:', transformedFavorites);

      if (transformedFavorites.length === 0) {
        console.log('No favorites found or transformation resulted in empty array');
      }

      setFavorites(transformedFavorites);
    } catch (error: any) {
      console.error('Error in fetchFavorites:', error);
      toast({
        title: "Error loading favorites",
        description: error.message || "Failed to load favorites. Please try again.",
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
