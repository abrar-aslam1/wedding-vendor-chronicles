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

const VendorDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<SearchResult | null>(location.state?.vendor || null);
  const [suggestedVendors, setSuggestedVendors] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  useEffect(() => {
    const fetchSuggestedVendors = async () => {
      if (!vendor?.category) return;
      
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

  if (!vendor) {
    return (
      <div className="min-h-screen bg-wedding-light">
        <MainNav />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Vendor Not Found</h1>
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
    <div className="min-h-screen bg-wedding-light">
      <MainNav />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/top-20/${vendor.category?.toLowerCase().replace(/ /g, '-')}`}>
                {vendor.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
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
                  <span>Available for appointments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-wedding-primary" />
                  <span>Price available upon request</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-wedding-primary" />
                  <span>Service area: {vendor.city || "Local area"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-wedding-primary" />
                  <span>Team size: Available upon request</span>
                </div>
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
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span>9:00 AM - 5:00 PM</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span>By appointment</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span>Closed</span>
                </p>
              </div>
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
    </div>
  );
};

export default VendorDetail;