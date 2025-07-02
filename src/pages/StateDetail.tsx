import { useParams, useNavigate } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Camera, Home, Utensils, Music, Palette, Scissors, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StateData {
  state: string;
  vendor_count: number;
  popular_cities: string[];
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

// Fallback cities for common states
const getDefaultCitiesForState = (stateName: string): string[] => {
  const defaultCities: Record<string, string[]> = {
    'Texas': ['Dallas', 'Houston', 'Austin', 'San Antonio', 'Fort Worth'],
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'],
    'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
    'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'],
  };
  
  return defaultCities[stateName] || ['Capital City', 'Main City', 'Downtown'];
};

export default function StateDetail() {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const [stateData, setStateData] = useState<StateData | null>(null);
  const [loading, setLoading] = useState(true);

  const stateName = state ? state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  useEffect(() => {
    const fetchStateData = async () => {
      if (!state) return;
      
      try {
        const { data, error } = await supabase
          .from('location_metadata')
          .select('*')
          .ilike('state', stateName)
          .is('city', null)
          .maybeSingle();

        if (error) {
          console.error('Error fetching state data:', error);
        }

        if (data) {
          setStateData({
            state: data.state,
            vendor_count: data.vendor_count || 0,
            popular_cities: Array.isArray(data.popular_cities) 
              ? data.popular_cities.map(city => String(city))
              : [],
            average_rating: data.average_rating || 4.5
          });
        } else {
          // Fallback: create basic state data with some default cities
          const defaultCities = getDefaultCitiesForState(stateName);
          setStateData({
            state: stateName,
            vendor_count: 0,
            popular_cities: defaultCities,
            average_rating: 4.5
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStateData();
  }, [state, stateName]);

  const handleCategoryClick = (categorySlug: string) => {
    // Go directly to state-wide results - simple and straightforward
    navigate(`/top-20/${categorySlug}/all-cities/${state}`);
  };

  const handleCityClick = (city: string) => {
    navigate(`/states/${state}/${city.toLowerCase().replace(/\s+/g, '-')}`);
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
        customTitle={`Wedding Vendors in ${stateName}`}
        customDescription={`Find the best wedding vendors in ${stateName}. Browse photographers, venues, caterers, and more in cities across ${stateName}.`}
        canonicalUrl={`${window.location.origin}/states/${state}`}
        state={stateName}
      />
      <MainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-wedding-text mb-4">
              Wedding Vendors in {stateName}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Choose what you're looking for and where you want to find it
            </p>
            {stateData && (
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{stateData.vendor_count.toLocaleString()} vendors</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{stateData.popular_cities.length} cities</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Cities Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-wedding-text mb-6 text-center">
              Choose a city in {stateName}
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select a city to browse wedding vendors in that area
            </p>
          </div>

          {/* Popular Cities */}
          {stateData && stateData.popular_cities.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-wedding-text mb-6 text-center">
                Popular Cities in {stateName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateData.popular_cities.slice(0, 9).map((city) => (
                  <Card 
                    key={city}
                    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                    onClick={() => handleCityClick(city)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-wedding-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-wedding-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-wedding-text group-hover:text-wedding-primary transition-colors">
                            {city}
                          </h3>
                          <p className="text-sm text-gray-500">All vendor types</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-wedding-text mb-6">
              Or browse all vendors in {stateName}
            </h2>
            <Button 
              onClick={() => navigate(`/top-20/wedding-vendors/all-cities/${state}`)}
              className="bg-wedding-primary hover:bg-wedding-primary/90 text-white px-8 py-3 text-lg"
            >
              View All Vendors in {stateName}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
