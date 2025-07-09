import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { VendorCard } from "./VendorCard";
import { InstagramVendorCard } from "./InstagramVendorCard";
import { ComingSoonBanner } from "./ComingSoonBanner";
import { SearchSkeleton } from "./SearchSkeleton";
import { MobileTabContainer } from "./MobileTabContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Instagram } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  subcategory?: string;
}

export const SearchResults = ({ results, isSearching, subcategory }: SearchResultsProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Separate results by source - Google, database, and sample vendors go in left column, Instagram in right
  const googleResults = results.filter(result => 
    result.vendor_source === 'google' || 
    result.vendor_source === 'database' || 
    result.vendor_source === 'google_database' ||
    result.vendor_source === 'sample' ||
    !result.vendor_source // fallback for results without vendor_source
  );
  const instagramResults = results.filter(result => result.vendor_source === 'instagram');

  useEffect(() => {
    console.log('🔍 SearchResults useEffect triggered');
    console.log('Search Results component received:', { 
      resultsCount: results.length, 
      isSearching,
      sampleResult: results[0] ? {
        title: results[0].title,
        vendor_source: results[0].vendor_source,
        hasVendorSource: 'vendor_source' in results[0]
      } : null
    });
    
    // Detailed breakdown by vendor source
    const sourceBreakdown = results.reduce((acc, result) => {
      const source = result.vendor_source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Results by vendor source:', sourceBreakdown);
    console.log('Separated results:', { 
      googleResults: googleResults.length, 
      instagramResults: instagramResults.length,
      googleSample: googleResults[0] ? `${googleResults[0].title} (${googleResults[0].vendor_source})` : 'none',
      instagramSample: instagramResults[0] ? `${instagramResults[0].title} (${instagramResults[0].vendor_source})` : 'none'
    });
    
    console.log('🎯 Component render decision:', {
      resultsLength: results.length,
      isSearching,
      googleResultsLength: googleResults.length,
      instagramResultsLength: instagramResults.length,
      willShowResults: results.length > 0,
      willShowNoResults: results.length === 0 && !isSearching
    });
    
    fetchFavorites();
    if (isSearching) {
      setHasSearched(true);
    }
    // Also set hasSearched to true when we receive results (including sample results)
    if (results.length > 0) {
      setHasSearched(true);
    }
  }, [results, isSearching, googleResults.length, instagramResults.length]);

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
          const { error: deleteError } = await supabase
            .from('vendor_favorites')
            .delete()
            .eq('vendor_id', vendor.place_id)
            .eq('user_id', session.session.user.id);

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
          const ratingData = vendor.rating ? {
            value: typeof vendor.rating.value === 'number' ? vendor.rating.value : 0,
            votes_count: typeof vendor.rating.votes_count === 'number' ? vendor.rating.votes_count : 0,
            count: typeof vendor.rating.count === 'number' ? vendor.rating.count : 
                  (typeof vendor.rating.votes_count === 'number' ? vendor.rating.votes_count : 0)
          } : null;

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

  // Get vendor type from URL
  const [vendorType, setVendorType] = useState<string>('vendors');
  
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/favorites') {
      setVendorType('Vendors');
      return;
    }
    
    const matches = path.match(/\/top-20\/([^\/]+)/);
    if (matches && matches[1]) {
      const slug = matches[1];
      let displayType = slug.replace(/-/g, ' ');
      displayType = displayType
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setVendorType(displayType);
    }
  }, []);

  const getSingularVendorType = () => {
    const type = vendorType.toLowerCase();
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
    return type.endsWith('s') ? type.slice(0, -1) : type;
  };

  const getSubcategoryDescription = () => {
    const type = vendorType.toLowerCase();
    const formattedSubcategory = subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : '';
    
    if (type === 'caterers') return `${formattedSubcategory} Cuisine`;
    if (type === 'wedding planners') return `${formattedSubcategory}`;
    if (type === 'photographers') return `${formattedSubcategory} Style`;
    if (type === 'florists') return `${formattedSubcategory} Style`;
    if (type === 'venues') return `${formattedSubcategory} Venues`;
    if (type === 'djs & bands') return `${formattedSubcategory}`;
    return formattedSubcategory;
  };

  console.log('🚨 RENDER DECISION:', 
    'isSearching:', isSearching,
    'resultsLength:', results.length,
    'googleResultsLength:', googleResults.length,
    'instagramResultsLength:', instagramResults.length,
    'hasSearched:', hasSearched,
    'isFavoritesPage:', window.location.pathname === '/favorites'
  );

  if (isSearching) {
    console.log('🔄 Rendering SearchSkeleton');
    return <SearchSkeleton />;
  }

  const isFavoritesPage = window.location.pathname === '/favorites';

  // If no results at all and we're on favorites page, show the old single-column layout
  if (results.length === 0 && !isSearching && isFavoritesPage) {
    console.log('💔 Rendering favorites no results');
    return (
      <div className="mt-8 md:mt-12 text-center">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="mb-4 text-wedding-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-wedding-text mb-2">No Favorites Yet</h3>
          <p className="text-gray-600 mb-4">
            You don't have any favorites yet. Browse vendors and click the heart icon to add them to your favorites.
          </p>
        </div>
      </div>
    );
  }

  // If no results but we're on a search page, show mobile tabs or smart layout
  // Only show "No Results" if we've actually completed a search (hasSearched is true)
  if (results.length === 0 && !isSearching && !isFavoritesPage && hasSearched) {
    console.log('🚫 Rendering no results page');
    return (
      <div>
        {/* Header with subcategory info */}
        {subcategory && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-wedding-text">
              Showing {vendorType} Specializing in {getSubcategoryDescription()}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              0 {vendorType.toLowerCase()} found - but we're working on it!
            </p>
          </div>
        )}

        {/* Mobile Tab Layout or Desktop 2-Column Layout */}
        {isMobile ? (
          <MobileTabContainer
            googleResults={[]}
            instagramResults={[]}
            favorites={favorites}
            loading={loading}
            onToggleFavorite={toggleFavorite}
            subcategory={subcategory}
            vendorType={vendorType}
          />
        ) : (
          /* Desktop 2-Column Layout with Coming Soon Banners */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Google Results Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Google Results
                </div>
                <span className="text-sm text-gray-500">0 results</span>
              </div>
              <ComingSoonBanner type="google" vendorType={vendorType} />
            </div>

            {/* Instagram Results Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Instagram className="h-4 w-4" />
                  Instagram Results
                </div>
                <span className="text-sm text-gray-500">0 results</span>
              </div>
              <ComingSoonBanner type="instagram" vendorType={vendorType} />
            </div>
          </div>
        )}
      </div>
    );
  }

  console.log('✅ Rendering main results layout with', results.length, 'results');
  
  return (
    <div>
      {/* Header with subcategory info */}
      {subcategory && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-wedding-text mb-3">
            {vendorType} Specializing in {getSubcategoryDescription()}
          </h2>
          <p className="text-base text-gray-600 bg-gray-50 rounded-full px-4 py-2 inline-block">
            {results.length} {results.length === 1 ? getSingularVendorType() : vendorType.toLowerCase()} found
          </p>
        </div>
      )}

      {/* Mobile Tab Layout */}
      {isMobile ? (
        <MobileTabContainer
          googleResults={googleResults}
          instagramResults={instagramResults}
          favorites={favorites}
          loading={loading}
          onToggleFavorite={toggleFavorite}
          subcategory={subcategory}
          vendorType={vendorType}
        />
      ) : (
        /* Always Show 2-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Google Results Column */}
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-200">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-base font-semibold shadow-lg">
                <MapPin className="h-5 w-5" />
                Google Results
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {googleResults.length} {googleResults.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            
            {googleResults.length > 0 ? (
              <div className="space-y-6">
                {(() => {
                  console.log('🎯 Rendering', googleResults.length, 'VendorCard components');
                  return googleResults.map((vendor, index) => {
                    console.log(`🏪 Rendering VendorCard ${index}:`, vendor.title, vendor.vendor_source);
                    return (
                      <VendorCard
                        key={`google-${index}`}
                        vendor={vendor}
                        isFavorite={favorites.has(vendor.place_id || '')}
                        isLoading={loading.has(vendor.place_id || '')}
                        onToggleFavorite={toggleFavorite}
                        subcategory={subcategory}
                      />
                    );
                  });
                })()}
              </div>
            ) : (
              <ComingSoonBanner type="google" vendorType={vendorType} />
            )}
          </div>

          {/* Instagram Results Column */}
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-200">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-base font-semibold shadow-lg">
                <Instagram className="h-5 w-5" />
                Instagram Results
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {instagramResults.length} {instagramResults.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            
            {instagramResults.length > 0 ? (
              <div className="space-y-6">
                {instagramResults.map((vendor, index) => (
                  <InstagramVendorCard
                    key={`instagram-${index}`}
                    vendor={vendor}
                    isFavorite={favorites.has(vendor.place_id || '')}
                    isLoading={loading.has(vendor.place_id || '')}
                    onToggleFavorite={toggleFavorite}
                    subcategory={subcategory}
                  />
                ))}
              </div>
            ) : (
              <ComingSoonBanner type="instagram" vendorType={vendorType} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
