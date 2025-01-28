import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { searchVendors } from "@/services/dataForSeoService";
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
    <section className="relative py-20 overflow-hidden min-h-[600px] flex items-center" 
      style={{
        background: "linear-gradient(135deg, #f8bbd0, #fce4ec, #fff1f2)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('/lovable-uploads/fc1186f3-9e97-4be6-910e-9851d1205033.png')",
          backgroundSize: "20%",
          backgroundRepeat: "repeat",
          filter: "brightness(1.1)"
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-wedding-text mb-6 drop-shadow-sm">
            Find Your Perfect Wedding Vendors
          </h1>
          <p className="text-lg text-gray-700 drop-shadow-sm">
            Discover and connect with the best wedding professionals in your area
          </p>
        </div>

        <div className="max-w-2xl mx-auto backdrop-blur-sm bg-white/90 p-6 rounded-lg shadow-lg">
          <SearchForm onSearch={handleSearch} isSearching={isSearching} />
        </div>
      </div>
    </section>
  );
};