import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Heart, Calendar, Users2 } from "lucide-react";
import { SearchForm } from "@/components/search/SearchForm";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { searchVendors } from "@/utils/dataForSeoApi";
import { toast } from "@/components/ui/use-toast";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    checkAuth();
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const formatUrlSegment = (text: string) => {
    return text.toLowerCase().replace(/\s+&?\s+/g, "_");
  };

  const handleSearch = async (category: string, state: string, city: string) => {
    try {
      setIsSearching(true);
      
      // Check if user is authenticated before accessing vendor_cache
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to search for vendors",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      const locationString = `${city}, ${state}`;
      
      const { data: cachedResults, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('search_results')
        .eq('category', category.toLowerCase())
        .eq('city', city.toLowerCase())
        .eq('state', state.toLowerCase())
        .maybeSingle();

      if (cacheError) {
        console.error('Cache error:', cacheError);
        throw new Error('Failed to check cache');
      }

      if (cachedResults?.search_results && Array.isArray(cachedResults.search_results)) {
        console.log('Using cached results');
        
        const formattedCategory = formatUrlSegment(category);
        const formattedCity = formatUrlSegment(city);
        const formattedState = formatUrlSegment(state);
        navigate(`/top-20/${formattedCategory}/${formattedCity}/${formattedState}`);
        
        toast({
          title: "Results found",
          description: `Found ${(cachedResults.search_results as SearchResult[]).length} vendors in ${locationString}`,
        });
        return;
      }

      // If no cache, perform search
      const results = await searchVendors(category, locationString);
      
      if (!results || results.length === 0) {
        toast({
          title: "No results found",
          description: "Try searching in a different location",
          variant: "destructive",
        });
        return;
      }

      // Format URL segments and navigate
      const formattedCategory = formatUrlSegment(category);
      const formattedCity = formatUrlSegment(city);
      const formattedState = formatUrlSegment(state);
      navigate(`/top-20/${formattedCategory}/${formattedCity}/${formattedState}`);
      
      toast({
        title: "Search completed",
        description: `Found ${results.length} vendors in ${locationString}`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Error searching vendors",
        description: error.message || "An error occurred while searching",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-wedding-primary via-wedding-secondary to-[#ffd1dc] overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center"
        style={{ filter: 'brightness(0.7)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32 pb-12 md:pb-24">
        <div className="max-w-3xl mx-auto text-center space-y-2 md:space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Find Your Perfect
            <br />
            Wedding Vendors
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Book your dream wedding team
            <br />
            with trusted professionals
          </p>

          {/* Search Form */}
          <div className="mt-8 max-w-2xl mx-auto">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>

          {/* Features Grid - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Easy Search"
              description="Find vendors instantly"
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Save Favorites"
              description="Keep track of your picks"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Book Online"
              description="Schedule appointments"
            />
            <FeatureCard
              icon={<Users2 className="h-6 w-6" />}
              title="Read Reviews"
              description="From real couples"
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-transform">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-wedding-primary/20 text-wedding-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-wedding-text">{title}</h3>
      <p className="text-sm text-wedding-text/70">{description}</p>
    </div>
  );
};