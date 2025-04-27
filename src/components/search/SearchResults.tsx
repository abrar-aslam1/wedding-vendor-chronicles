import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { VendorCard } from "./VendorCard";
import { SearchSkeleton } from "./SearchSkeleton";

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  subcategory?: string;
}

export const SearchResults = ({ results, isSearching, subcategory }: SearchResultsProps) => {
  // Format subcategory for display
  const formattedSubcategory = subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : '';
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Search Results component received:', { results, isSearching });
    fetchFavorites();
    if (isSearching) {
      setHasSearched(true);
    }
  }, [results, isSearching]);

  const fetchFavorites = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session);

      if (!session?.session?.user) {
        console.log('No authenticated user found');
        return;
      }

      const { data: favoritesData, error } = await supabase
        .from('vendor_favorites')
        .select('vendor_id')
        .eq('user_id', session.session.user.id);

      console.log('Favorites fetch response:', { favoritesData, error });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      if (favoritesData && Array.isArray(favoritesData)) {
        // Filter out any undefined or null vendor_ids
        const validFavoriteIds = favoritesData
          .filter(f => f && f.vendor_id)
          .map(f => f.vendor_id);
        
        console.log('Valid favorite IDs:', validFavoriteIds);
        setFavorites(new Set(validFavoriteIds));
      } else {
        console.log('No favorites data found or invalid format');
        setFavorites(new Set());
      }
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      // Don't reset favorites on error to avoid UI flashing
    }
  };

  const toggleFavorite = async (vendor: SearchResult) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to favorite vendors",
          variant: "destructive",
        });
        return;
      }

      if (!vendor.place_id) {
        console.error('Cannot toggle favorite: vendor has no place_id');
        return;
      }

      setLoading(prev => new Set([...prev, vendor.place_id!]));

      try {
        if (favorites.has(vendor.place_id)) {
          // Remove from favorites
          const { error: deleteError } = await supabase
            .from('vendor_favorites')
            .delete()
            .eq('vendor_id', vendor.place_id)
            .eq('user_id', session.session.user.id);

          console.log('Delete favorite response:', { deleteError });

          if (deleteError) {
            console.error('Error removing from favorites:', deleteError);
            throw new Error(deleteError.message);
          }

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
          // Add to favorites - ensure rating object is properly structured
          const ratingData = vendor.rating ? {
            value: typeof vendor.rating.value === 'number' ? vendor.rating.value : 0,
            votes_count: typeof vendor.rating.votes_count === 'number' ? vendor.rating.votes_count : 0,
            count: typeof vendor.rating.count === 'number' ? vendor.rating.count : 
                  (typeof vendor.rating.votes_count === 'number' ? vendor.rating.votes_count : 0)
          } : null;

          // Create a JSON-serializable version of the vendor data
          // Only include simple properties that can be safely stored in Supabase
          const vendorData = {
            title: vendor.title || '',
            description: vendor.description || '',
            snippet: vendor.snippet || vendor.description || '',
            phone: vendor.phone || '',
            address: vendor.address || '',
            url: vendor.url || '',
            place_id: vendor.place_id || '',
            main_image: vendor.main_image || '',
            images: Array.isArray(vendor.images) ? vendor.images : [],
            rating: ratingData,
            // Include new fields as simple JSON-serializable values
            latitude: vendor.latitude || null,
            longitude: vendor.longitude || null,
            price_range: vendor.price_range || '',
            payment_methods: Array.isArray(vendor.payment_methods) ? vendor.payment_methods : [],
            service_area: Array.isArray(vendor.service_area) ? vendor.service_area : [],
            categories: Array.isArray(vendor.categories) ? vendor.categories : [],
            year_established: vendor.year_established || '',
            email: vendor.email || '',
            city: vendor.city || '',
            state: vendor.state || '',
            postal_code: vendor.postal_code || '',
            // Convert complex objects to simple JSON
            business_hours: vendor.business_hours ? JSON.stringify(vendor.business_hours) : null,
            reviews: vendor.reviews ? JSON.stringify(vendor.reviews) : null
          };

          const { error: insertError } = await supabase
            .from('vendor_favorites')
            .insert({
              user_id: session.session.user.id,
              vendor_id: vendor.place_id,
              vendor_data: vendorData,
            });

          console.log('Insert favorite response:', { insertError });

          if (insertError) {
            console.error('Error adding to favorites:', insertError);
            throw new Error(insertError.message);
          }

          setFavorites(prev => new Set([...prev, vendor.place_id!]));

          toast({
            title: "Added to favorites",
            description: "Vendor has been added to your favorites",
          });
        }
      } catch (error: any) {
        console.error('Favorite operation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update favorites. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (vendor.place_id) {
        setLoading(prev => {
          const next = new Set(prev);
          next.delete(vendor.place_id!);
          return next;
        });
      }
    }
  };

  if (isSearching) {
    return <SearchSkeleton />;
  }

  // Get vendor type from URL
  const [vendorType, setVendorType] = useState<string>('vendors');
  
  useEffect(() => {
    // Check if we're on the Favorites page
    const path = window.location.pathname;
    if (path === '/favorites') {
      setVendorType('Vendors');
      return;
    }
    
    // Extract vendor type from URL for category pages
    const matches = path.match(/\/top-20\/([^\/]+)/);
    if (matches && matches[1]) {
      // Convert slug to display name
      const slug = matches[1];
      let displayType = slug.replace(/-/g, ' ');
      // Capitalize first letter of each word
      displayType = displayType
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setVendorType(displayType);
    }
  }, []);
  
  // Get singular form of vendor type
  const getSingularVendorType = () => {
    const type = vendorType.toLowerCase();
    // Handle special cases
    if (type === 'caterers') return 'caterer';
    if (type === 'photographers') return 'photographer';
    if (type === 'videographers') return 'videographer';
    if (type === 'florists') return 'florist';
    if (type === 'venues') return 'venue';
    if (type === 'djs & bands') return 'entertainment provider';
    if (type === 'cake designers') return 'cake designer';
    if (type === 'bridal shops') return 'bridal shop';
    if (type === 'makeup artists') return 'makeup artist';
    if (type === 'hair stylists') return 'hair stylist';
    // Default: remove trailing 's'
    return type.endsWith('s') ? type.slice(0, -1) : type;
  };
  
  // Get appropriate subcategory description based on vendor type
  const getSubcategoryDescription = () => {
    const type = vendorType.toLowerCase();
    if (type === 'caterers') return `${formattedSubcategory} Cuisine`;
    if (type === 'wedding planners') return `${formattedSubcategory}`;
    if (type === 'photographers') return `${formattedSubcategory} Style`;
    if (type === 'florists') return `${formattedSubcategory} Style`;
    if (type === 'venues') return `${formattedSubcategory} Venues`;
    if (type === 'djs & bands') return `${formattedSubcategory}`;
    return formattedSubcategory;
  };

  // Check if we're on the Favorites page
  const isFavoritesPage = window.location.pathname === '/favorites';

  if (results.length === 0 && !isSearching) {
    return (
      <div className="mt-8 md:mt-12 text-center">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="mb-4 text-wedding-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-wedding-text mb-2">
            {isFavoritesPage 
              ? "No Favorites Yet"
              : "No Results Found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {isFavoritesPage 
              ? "You don't have any favorites yet. Browse vendors and click the heart icon to add them to your favorites."
              : subcategory 
                ? `We couldn't find any ${vendorType.toLowerCase()} specializing in ${getSubcategoryDescription()} in this area.`
                : `We couldn't find any ${vendorType.toLowerCase()} in this area.`}
          </p>
          <div className="text-sm text-gray-500">
            {!isFavoritesPage && (
              <div className="space-y-2">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {subcategory && (
                    <li>Try a different specialization or category</li>
                  )}
                  <li>Check your spelling and location</li>
                  <li>Try searching in a larger nearby city</li>
                  <li>Broaden your search criteria</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {subcategory && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-wedding-text">
            Showing {vendorType} Specializing in {getSubcategoryDescription()}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {results.length} {results.length === 1 ? getSingularVendorType() : vendorType.toLowerCase()} found
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {results.map((vendor, index) => (
          <VendorCard
            key={index}
            vendor={vendor}
            isFavorite={favorites.has(vendor.place_id || '')}
            isLoading={loading.has(vendor.place_id || '')}
            onToggleFavorite={toggleFavorite}
            subcategory={subcategory}
          />
        ))}
      </div>
    </div>
  );
};
