import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SearchForm } from "@/components/search/SearchForm";

export const HeroSection = () => {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-wedding-light to-wedding-secondary py-8 lg:py-0">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="space-y-8 md:space-y-6 text-center md:text-left max-w-2xl mx-auto md:mx-0">
          <div>
            <h2 className="font-heading text-wedding-primary text-sm md:text-base uppercase tracking-wider mb-6 md:mb-4">
              DISCOVER YOUR DREAM WEDDING TEAM
            </h2>
            <h1 className="font-heading text-4xl md:text-3xl lg:text-4xl font-bold text-wedding-text leading-tight">
              Find the Perfect Vendors
              <br />
              for Your Special Day
            </h1>
          </div>
          
          <p className="font-body text-xl md:text-lg text-wedding-text/80 max-w-lg mx-auto md:mx-0">
            Connect with trusted wedding professionals who will bring your vision to life. 
            From photographers to florists, we'll help you build your perfect wedding team.
          </p>

          <div className="max-w-xl backdrop-blur-sm bg-white/90 p-6 rounded-xl shadow-lg mx-auto md:mx-0">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>
        </div>
      </div>
    </section>
  );
};