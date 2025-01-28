import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "@/components/search/RatingDisplay";
import { VendorContactInfo } from "@/components/search/VendorContactInfo";
import { SearchResult } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart } from "lucide-react";

const VendorDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<SearchResult | null>(location.state?.vendor || null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check authentication status
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

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

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
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search Results
        </Button>

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

            <div className="prose max-w-none mb-6">
              <p className="text-gray-600">
                {vendor.description || vendor.snippet || "No description available"}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <VendorContactInfo 
                phone={vendor.phone}
                address={vendor.address}
                url={vendor.url}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;