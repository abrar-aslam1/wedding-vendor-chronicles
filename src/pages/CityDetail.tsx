import { useParams, useNavigate } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Camera, Home, Utensils, Music, Palette, Scissors, Heart, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CityData {
  city: string;
  state: string;
  vendor_count: number;
  average_rating: number;
}

const vendorCategories = [
  { name: "Photographers", icon: Camera, slug: "photographers", color: "bg-blue-500" },
  { name: "Venues", icon: Home, slug: "venues", color: "bg-green-500" },
  { name: "Caterers", icon: Utensils, slug: "caterers", color: "bg-orange-500" },
  { name: "DJs & Bands", icon: Music, slug: "djs-and-bands", color: "bg-purple-500" },
  { name: "Florists", icon: Palette, slug: "florists", color: "bg-pink-500" },
  { name: "Hair Stylists", icon: Scissors, slug: "hair-stylists", color: "bg-yellow-500" },
  { name: "Makeup Artists", icon: Heart, slug: "makeup-artists", color: "bg-red-500" },
  { name: "Wedding Planners", icon: Users, slug: "wedding-planners", color: "bg-indigo-500" },
];

export default function CityDetail() {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  const stateName = state ? state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  const cityName = city ? city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  useEffect(() => {
    const fetchCityData = async () => {
      if (!state || !city) return;
      
      try {
        const { data, error } = await supabase
          .from('location_metadata')
          .select('*')
          .ilike('state', stateName)
          .ilike('city', cityName)
          .maybeSingle();

        if (error) {
          console.error('Error fetching city data:', error);
        }

        if (data) {
          setCityData({
            city: data.city,
            state: data.state,
            vendor_count: data.vendor_count || 0,
            average_rating: data.average_rating || 4.5
          });
        } else {
          // Fallback: create basic city data
          setCityData({
            city: cityName,
            state: stateName,
            vendor_count: 0,
            average_rating: 4.5
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [state, city, stateName, cityName]);

  const handleCategoryClick = (categorySlug: string) => {
    // Navigate to search results using the correct URL structure
    navigate(`/top-20/${categorySlug}/${city}/${state}`);
  };

  const handleBackToState = () => {
    navigate(`/states/${state}`);
  };

  const handleAllVendorsClick = () => {
    navigate(`/top-20/wedding-vendors/${city}/${state}`);
  };

  if (loading) {
    return (
      <>
        <MainNav />
        <div className="pt-20 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        customTitle={`Wedding Vendors in ${cityName}, ${stateName}`}
        customDescription={`Find the best wedding vendors in ${cityName}, ${stateName}. Browse photographers, venues, caterers, and more wedding professionals in ${cityName}.`}
        canonicalUrl={`${window.location.origin}/states/${state}/${city}`}
        state={stateName}
        city={cityName}
      />
      <MainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToState}
              className="text-wedding-primary hover:text-wedding-primary/80 p-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {stateName}
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-wedding-text mb-4">
              Wedding Vendors in {cityName}, {stateName}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Choose the type of wedding vendor you're looking for
            </p>
            {cityData && (
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{cityName}, {stateName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{cityData.vendor_count.toLocaleString()} vendors</span>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-wedding-text mb-6 text-center">
              What type of vendor are you looking for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vendorCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.slug}
                    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-wedding-text group-hover:text-wedding-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">in {cityName}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All Vendors Option */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-wedding-text mb-6">
              Or browse all vendor types
            </h2>
            <Button 
              onClick={handleAllVendorsClick}
              className="bg-wedding-primary hover:bg-wedding-primary/90 text-white px-8 py-3 text-lg"
            >
              View All Vendors in {cityName}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
