import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SearchForm } from "@/components/search/SearchForm";

export const HeroSection = () => {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (category: string, state: string, city: string) => {
    try {
      console.log('SearchForm submitting:', { categoryToUse: category, selectedState: state, selectedCity: city });
      setIsSearching(true);
      const locationString = `${city}, ${state}`;
      
      const formattedCategory = category.toLowerCase().replace(/ /g, '-');
      navigate(`/top-20/${formattedCategory}/${city}/${state}`);
      
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
            <h2 className="font-heading text-wedding-primary font-semibold mb-6 md:mb-4 tracking-wider text-xl md:text-lg uppercase">
              BEST WEDDING VENDORS AROUND YOU
            </h2>
            <h1 className="font-heading text-4xl md:text-3xl lg:text-4xl font-bold text-wedding-text leading-tight">
              It's your special day.
              <br />
              We'll help you make it perfect.
            </h1>
          </div>
          
          <p className="font-body text-xl md:text-lg text-wedding-text/80 max-w-lg mx-auto md:mx-0">
            Dedicated to making wedding planning as simple as possible, 
            we help each and every couple find the best vendors to create 
            their dream wedding.
          </p>

          <div className="max-w-xl backdrop-blur-sm bg-white/90 p-6 rounded-xl shadow-lg mx-auto md:mx-0">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>
        </div>
      </div>
    </section>
  );
};