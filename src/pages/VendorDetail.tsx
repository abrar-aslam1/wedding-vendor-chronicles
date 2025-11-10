import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "@/components/search/RatingDisplay";
import { VendorContactInfo } from "@/components/search/VendorContactInfo";
import { SearchResult } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Clock, DollarSign, MapPin, Camera, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { VendorCard } from "@/components/search/VendorCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { StickyVendorCTA } from "@/components/vendor/StickyVendorCTA";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  getPriceRangeDisplay,
  getServiceAreaDisplay,
  getBusinessHoursDisplay,
  getFallbackMessage
} from "@/utils/dataValidation";
import { trackVendorView, trackVendorContact } from "@/lib/analytics";

const VendorDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<SearchResult | null>(location.state?.vendor || null);
  const [suggestedVendors, setSuggestedVendors] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(!location.state?.vendor);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch vendor data if not available from navigation state
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId || vendor) return;
      
      setIsLoadingVendor(true);
      try {
        // Try to fetch from vendor_cache first
        const { data: cachedData, error: cacheError } = await supabase
          .from('vendor_cache')
          .select('search_results')
          .limit(10);
        
        if (cachedData && !cacheError) {
          // Search through all cached results for the vendor
          for (const cache of cachedData) {
            const results = cache.search_results as SearchResult[];
            const foundVendor = results.find(v => v.place_id === vendorId);
            if (foundVendor) {
              setVendor(foundVendor);
              break;
            }
          }
        }
        
        // If still not found, try vendor_favorites table
        if (!vendor) {
          const { data: favoriteData } = await supabase
            .from('vendor_favorites')
            .select('vendor_data')
            .eq('vendor_id', vendorId)
            .limit(1)
            .single();
          
          if (favoriteData?.vendor_data) {
            setVendor(favoriteData.vendor_data as SearchResult);
          }
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setIsLoadingVendor(false);
        setIsLoading(false);
      }
    };
    
    fetchVendorData();
  }, [vendorId, vendor]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view vendor details",
          variant: "destructive",
        });
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // Track vendor view when vendor data is loaded
  useEffect(() => {
    if (vendor) {
      trackVendorView(vendor.place_id, vendor.category || 'Unknown', {
        vendor_name: vendor.name,
        rating: vendor.rating,
        total_reviews: vendor.user_ratings_total,
      });
    }
  }, [vendor]);

  useEffect(() => {
    const fetchSuggestedVendors = async () => {
      if (!vendor?.category) return;

      try {

      const { data: cachedResults } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', vendor.category)
        .limit(1)
        .single();

        if (cachedResults?.search_results) {
          const filtered = (cachedResults.search_results as SearchResult[])
            .filter(v => v.place_id !== vendor.place_id)
            .slice(0, 3);
          setSuggestedVendors(filtered);
        }
      } catch (error) {
        console.error('Error fetching suggested vendors:', error);
      }
    };

    fetchSuggestedVendors();
  }, [vendor]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user?.id || !vendorId) return;

      const { data, error } = await supabase
        .from('vendor_favorites')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorite(!!data);
    };

    checkFavoriteStatus();
  }, [session, vendorId]);

  const handleToggleFavorite = async () => {
    if (!session?.user?.id || !vendor) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('vendor_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('vendor_id', vendor.place_id);

        if (error) throw error;
        setIsFavorite(false);

        // Track favorite removal
        const { trackVendorFavorite } = await import("@/lib/analytics");
        trackVendorFavorite(vendor.place_id, 'remove');

        toast({
          title: "Removed from favorites",
          description: "Vendor has been removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('vendor_favorites')
          .insert({
            user_id: session.user.id,
            vendor_id: vendor.place_id,
            vendor_data: vendor,
          });

        if (error) throw error;
        setIsFavorite(true);

        // Track favorite addition
        const { trackVendorFavorite } = await import("@/lib/analytics");
        trackVendorFavorite(vendor.place_id, 'add');

        toast({
          title: "Added to favorites",
          description: "Vendor has been added to your favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading || isLoadingVendor) {
    return (
      <div className="min-h-screen bg-wedding-light">
        <SEOHead />
        <SchemaMarkup isHomePage={true} />
        <MainNav />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-wedding-light">
        <SEOHead />
        <SchemaMarkup isHomePage={true} />
        <MainNav />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Vendor Not Found</h1>
            <p className="text-gray-600 mb-6">Sorry, we couldn't find the vendor you're looking for.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-wedding-light">
      <SEOHead 
        category={vendor.category}
        city={vendor.city}
        state={vendor.state}
        vendorName={vendor.title}
        tags={vendor.tags}
        priceRange={vendor.price_range}
      />
      <SchemaMarkup
        category={vendor.category}
        city={vendor.city}
        state={vendor.state}
        vendor={vendor}
      />
      <MainNav />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {vendor.category && (
              <BreadcrumbItem>
                <BreadcrumbLink href={`/top-20/${vendor.category.toLowerCase().replace(/ /g, '-')}`}>
                  {vendor.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{vendor.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {vendor.main_image && (
                <div className="relative h-96 w-full">
                  <img
                    src={vendor.main_image}
                    alt={vendor.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-semibold text-wedding-text">
                    {vendor.title}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {vendor.rating && vendor.rating.value && (
                  <RatingDisplay rating={vendor.rating} className="mb-4" />
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">About {vendor.title}</h2>
              <p className="text-gray-600 leading-relaxed">
                {vendor.description || vendor.snippet || "No description available"}
              </p>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-wedding-primary" />
                  <span>
                    {vendor.business_hours ? "See business hours below" : "Contact for availability"}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-wedding-primary" />
                  <span>{getPriceRangeDisplay(vendor.price_range)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-wedding-primary" />
                  <span>Service area: {getServiceAreaDisplay(vendor)}</span>
                </div>
                {vendor.year_established && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-wedding-primary" />
                    <span>Established: {vendor.year_established}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <VendorContactInfo 
                phone={vendor.phone}
                address={vendor.address}
                url={vendor.url}
                instagram={vendor.instagram}
                facebook={vendor.facebook}
                twitter={vendor.twitter}
              />
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
              {vendor.business_hours ? (
                <div className="space-y-2 text-sm">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const hours = getBusinessHoursDisplay(vendor.business_hours, day.toLowerCase());
                    return (
                      <p key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}</span>
                        <span>{hours}</span>
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">{getFallbackMessage('hours')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please contact the vendor directly for their availability
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Vendors Section */}
        {suggestedVendors.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Similar Vendors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedVendors.map((suggestedVendor, index) => (
                <VendorCard
                  key={index}
                  vendor={suggestedVendor}
                  isFavorite={false}
                  isLoading={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {vendor && (
        <StickyVendorCTA
          vendor={vendor}
          onCheckAvailability={() => {
            // TODO: Open availability modal or navigate to booking
            console.log('Check Availability clicked for:', vendor.title);
          }}
          onVisitWebsite={() => {
            if (vendor.url) {
              window.open(vendor.url, '_blank', 'noopener,noreferrer');
            }
          }}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
          showThreshold={500} // Show after scrolling past hero section
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default VendorDetail;
