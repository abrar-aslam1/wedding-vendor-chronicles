import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { SEOHead } from "@/components/SEOHead";
import { SearchForm } from "@/components/search/SearchForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Search, TrendingUp, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

const categoryInfo: { [key: string]: { title: string; description: string; image: string; tips: string[] } } = {
  "wedding-planners": {
    title: "Wedding Planners",
    description: "Find experienced wedding planners who will bring your dream wedding to life",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
    tips: ["Look for planners with experience in your wedding style", "Check their portfolio and past weddings", "Read reviews from recent couples"]
  },
  "photographers": {
    title: "Wedding Photographers",
    description: "Capture every magical moment with professional wedding photographers",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    tips: ["Review their portfolio for style consistency", "Ask about package inclusions", "Check availability for your date early"]
  },
  "videographers": {
    title: "Wedding Videographers",
    description: "Create lasting memories with cinematic wedding videography",
    image: "https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d",
    tips: ["Watch full wedding videos, not just highlights", "Discuss filming style preferences", "Ask about editing timeline"]
  },
  "florists": {
    title: "Wedding Florists",
    description: "Beautiful floral arrangements to enhance your special day",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    tips: ["Share your color palette and theme", "Ask about seasonal flower options", "Discuss preservation options"]
  },
  "caterers": {
    title: "Wedding Caterers",
    description: "Delight your guests with exceptional cuisine and service",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033",
    tips: ["Schedule tastings before booking", "Discuss dietary restrictions", "Ask about service staff included"]
  },
  "venues": {
    title: "Wedding Venues",
    description: "Find the perfect location for your ceremony and reception",
    image: "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
    tips: ["Visit venues in person when possible", "Ask about vendor restrictions", "Clarify what's included in rental"]
  },
  "djs-and-bands": {
    title: "DJs & Bands",
    description: "Keep your guests dancing with the perfect entertainment",
    image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4",
    tips: ["Listen to live performances or demos", "Discuss your must-play and do-not-play lists", "Confirm equipment and lighting included"]
  },
  "cake-designers": {
    title: "Wedding Cake Designers",
    description: "Create the perfect centerpiece for your reception with beautiful and delicious wedding cakes",
    image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52",
    tips: ["Schedule tastings early", "Consider dietary restrictions", "Ask about delivery and setup"]
  },
  "wedding-decorators": {
    title: "Wedding Decorators",
    description: "Transform your venue with stunning decorations that bring your vision to life",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    tips: ["Book early for peak season", "Discuss venue restrictions", "Consider lighting and ambiance", "Ask about setup and breakdown services"]
  }
};

interface PopularCity {
  city: string;
  state: string;
  vendor_count: number;
}

export default function CategorySearch() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const categoryData = category ? categoryInfo[category] : null;
  const displayCategory = category ? category.replace(/-/g, ' ') : '';

  useEffect(() => {
    const fetchPopularCities = async () => {
      if (!category) return;
      
      setLoadingCities(true);
      try {
        // For now, we'll use a predefined list of popular cities
        // In the future, this could be dynamic based on actual vendor data
        const cities = [
          { city: "New York", state: "NY", vendor_count: 245 },
          { city: "Los Angeles", state: "CA", vendor_count: 198 },
          { city: "Chicago", state: "IL", vendor_count: 167 },
          { city: "Houston", state: "TX", vendor_count: 156 },
          { city: "Miami", state: "FL", vendor_count: 143 },
          { city: "Dallas", state: "TX", vendor_count: 134 },
          { city: "Atlanta", state: "GA", vendor_count: 128 },
          { city: "Boston", state: "MA", vendor_count: 115 }
        ];
        
        setPopularCities(cities);
      } catch (error) {
        console.error('Error fetching popular cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchPopularCities();
  }, [category]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string, subcategory?: string) => {
    setIsSearching(true);
    
    const formattedCategory = displayCategory.toLowerCase().replace(/ /g, '-');
    const urlPath = subcategory 
      ? `/top-20/${formattedCategory}/${subcategory}/${selectedCity}/${selectedState}`
      : `/top-20/${formattedCategory}/${selectedCity}/${selectedState}`;
    
    navigate(urlPath);
  };

  const handleCityClick = (city: string, state: string) => {
    const formattedCategory = displayCategory.toLowerCase().replace(/ /g, '-');
    navigate(`/top-20/${formattedCategory}/${city}/${state}`);
  };

  if (!categoryData) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead category={displayCategory} />
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={categoryData.image} 
            alt={categoryData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-6 pb-8 md:pb-12 lg:pb-16">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-white/80 hover:text-white">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{categoryData.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find {categoryData.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
              {categoryData.description}
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-wedding-text mb-4">
                Search for {categoryData.title} in Your Area
              </h2>
              <p className="text-lg text-wedding-text/70">
                Enter your location to find the best {displayCategory} near you
              </p>
            </div>
            
            <Card className="p-6 md:p-8 shadow-lg">
              <SearchForm 
                onSearch={handleSearch} 
                isSearching={isSearching}
                preselectedCategory={displayCategory}
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-wedding-text mb-4">
              Popular Cities for {categoryData.title}
            </h2>
            <p className="text-lg text-wedding-text/70">
              Browse vendors in these popular wedding destinations
            </p>
          </div>
          
          {loadingCities ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {popularCities.map((city) => (
                <Card 
                  key={`${city.city}-${city.state}`}
                  className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCityClick(city.city, city.state)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-wedding-text group-hover:text-wedding-primary transition-colors">
                        {city.city}, {city.state}
                      </h3>
                      <p className="text-sm text-wedding-text/70">
                        {city.vendor_count}+ vendors
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-wedding-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Popular choice</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/states')}
              className="border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white"
            >
              Browse All States
            </Button>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-wedding-text mb-8 text-center">
              Tips for Choosing {categoryData.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryData.tips.map((tip, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-wedding-primary/10 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-wedding-primary" />
                      </div>
                    </div>
                    <p className="text-wedding-text/80">{tip}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
