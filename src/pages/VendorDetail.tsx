import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Vendor } from "@/types/search";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import { VendorHero } from "@/components/vendor/VendorHero";
import { VendorBusinessDetails } from "@/components/vendor/VendorBusinessDetails";
import { SuggestedVendors } from "@/components/vendor/SuggestedVendors";

const VendorDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [suggestedVendors, setSuggestedVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const vendor = location.state?.vendor;
    if (vendor) {
      setVendor(vendor);
      checkIfFavorited(vendor.id);
      fetchSuggestedVendors(vendor);
    } else {
      // Handle case where vendor data isn't in location state
      toast({
        title: "Error",
        description: "Vendor information not found",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [location.state, navigate, toast]);

  const checkIfFavorited = async (vendorId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: favorites } = await supabase
      .from("vendor_favorites")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("vendor_id", vendorId)
      .single();

    setIsFavorited(!!favorites);
  };

  const fetchSuggestedVendors = async (currentVendor: Vendor) => {
    const { data: cachedResults } = await supabase
      .from("vendor_cache")
      .select("search_results")
      .eq("category", currentVendor.category)
      .eq("city", currentVendor.city)
      .eq("state", currentVendor.state)
      .single();

    if (cachedResults?.search_results) {
      const otherVendors = cachedResults.search_results.filter(
        (v: Vendor) => v.id !== currentVendor.id
      ).slice(0, 3);
      setSuggestedVendors(otherVendors);
    }
  };

  const handleFavoriteClick = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!vendor) return;

    if (isFavorited) {
      const { error } = await supabase
        .from("vendor_favorites")
        .delete()
        .eq("user_id", user.user.id)
        .eq("vendor_id", vendor.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
        return;
      }

      setIsFavorited(false);
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } else {
      const { error } = await supabase.from("vendor_favorites").insert({
        user_id: user.user.id,
        vendor_id: vendor.id,
        vendor_data: vendor,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
        return;
      }

      setIsFavorited(true);
      toast({
        title: "Success",
        description: "Added to favorites",
      });
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-wedding-light">
        <SEOHead />
        <MainNav />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-semibold text-wedding-text mb-4">
              Vendor Not Found
            </h1>
            <p className="text-wedding-text mb-8">
              The vendor you're looking for could not be found.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-light">
      <SEOHead 
        category={vendor.category}
        city={vendor.city}
        state={vendor.state}
      />
      <MainNav />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/search/${vendor.category.toLowerCase()}`}>
                {vendor.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{vendor.business_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <VendorHero 
          vendor={vendor} 
          handleFavoriteClick={handleFavoriteClick}
          isFavorited={isFavorited}
        />

        <VendorBusinessDetails vendor={vendor} />

        <SuggestedVendors 
          vendors={suggestedVendors}
          category={vendor.category}
          city={vendor.city}
          state={vendor.state}
        />
      </div>
      <Footer />
    </div>
  );
};

export default VendorDetail;