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
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/ee8ae089-8393-414d-bcf0-b3b2f4098b0c.png" 
          alt="Wedding Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20 md:pt-0">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Not sure which vendor to choose?
            <br />
            Perfect.
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            We'll help you find the best wedding vendors in your area
          </p>

          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mt-8 backdrop-blur-sm bg-white/95">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>

          <button 
            onClick={() => navigate("/search/all")}
            className="inline-flex items-center justify-center px-6 py-3 mt-4 text-lg font-medium text-wedding-primary bg-white rounded-full hover:bg-wedding-primary hover:text-white transition-colors duration-300"
          >
            I'm Flexible
          </button>
        </div>
      </div>
    </section>
  );
};