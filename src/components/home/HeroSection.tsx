import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SearchForm } from "@/components/search/SearchForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const HeroSection = () => {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleListBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to list your business",
        variant: "default",
      });
      navigate("/auth?returnUrl=/list-business");
      return;
    }

    navigate("/list-business");
  };

  const handleSearch = async (category: string, state: string, city: string, subcategory?: string) => {
    try {
      console.log('SearchForm submitting:', { categoryToUse: category, selectedState: state, selectedCity: city, subcategory });
      setIsSearching(true);
      const locationString = `${city}, ${state}`;
      
      const formattedCategory = category.toLowerCase().replace(/ /g, '-');
      const urlPath = subcategory 
        ? `/top-20/${formattedCategory}/${subcategory}/${city}/${state}`
        : `/top-20/${formattedCategory}/${city}/${state}`;
      
      navigate(urlPath);
      
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
    <section className="relative min-h-[100svh] md:min-h-[80vh] lg:min-h-[85vh] flex items-center bg-gradient-to-br from-wedding-light to-wedding-secondary py-4 md:py-8 lg:py-0">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      
      {/* Desktop decorative elements */}
      <div className="hidden lg:block absolute top-20 right-10 w-72 h-72 bg-wedding-primary/10 rounded-full blur-3xl" />
      <div className="hidden lg:block absolute bottom-20 left-10 w-96 h-96 bg-wedding-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="md:max-w-4xl md:mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div className="space-y-6 md:space-y-8 lg:space-y-10 text-center md:text-center lg:text-left max-w-2xl mx-auto md:mx-auto lg:mx-0 lg:max-w-none">
            <div className="space-y-4 md:space-y-6">
              <h2 className="font-body text-wedding-primary text-xs sm:text-sm md:text-lg lg:text-lg uppercase tracking-wider mb-4 md:mb-6 lg:mb-4 lg:animate-fade-in">
                DISCOVER YOUR DREAM WEDDING TEAM
              </h2>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-wedding-text leading-tight md:leading-tight lg:leading-tight">
                Find the Perfect Vendors
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>for Your <span className="text-wedding-primary">Special Day</span>
              </h1>
            </div>
            
            <p className="font-body text-lg sm:text-xl md:text-xl lg:text-2xl text-wedding-text/80 max-w-lg mx-auto md:mx-auto lg:mx-0 lg:max-w-none px-2 sm:px-0">
              Connect with trusted wedding professionals who will bring your vision to life. 
              From photographers to florists, we'll help you build your perfect wedding team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-center lg:justify-start mt-6 md:mt-8 lg:mt-12">
              <div className="text-center md:text-center lg:text-left">
                <p className="text-wedding-text/70 text-sm mb-3 lg:text-base">
                  Are you a wedding vendor?
                </p>
                <Button
                  onClick={handleListBusiness}
                  size="lg"
                  className="bg-wedding-primary hover:bg-wedding-primary/90 text-white px-6 py-3 sm:px-8 sm:py-3 lg:px-12 lg:py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base lg:text-lg min-h-[48px]"
                >
                  <Plus className="h-5 w-5 mr-2 lg:h-6 lg:w-6" />
                  List Your Business
                </Button>
                <p className="text-wedding-text/60 text-xs mt-2 max-w-xs mx-auto md:mx-0 lg:text-sm">
                  Join thousands of vendors growing their business with us
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 lg:mt-0">
            <div className="max-w-xl md:max-w-2xl lg:max-w-2xl backdrop-blur-sm bg-white/95 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl mx-auto md:mx-auto lg:mx-0 border border-white/50">
              <h3 className="hidden lg:block text-2xl font-semibold text-wedding-text mb-6">Start Your Search</h3>
              <h3 className="block lg:hidden text-xl font-semibold text-wedding-text mb-4 text-center">Start Your Search</h3>
              <SearchForm onSearch={handleSearch} isSearching={isSearching} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
