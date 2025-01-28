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
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-wedding-light to-wedding-secondary">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-wedding-primary font-semibold mb-4">BEST WEDDING VENDORS AROUND YOU</h2>
              <h1 className="text-4xl md:text-6xl font-bold text-wedding-text leading-tight">
                It's your 
                <br />
                special day.
                <br />
                We'll help you
                <br />
                make it perfect.
              </h1>
            </div>
            
            <p className="text-lg text-wedding-text/80 max-w-lg">
              Dedicated to making wedding planning as simple as possible, 
              we help each and every couple find the best vendors to create 
              their dream wedding.
            </p>

            <div className="max-w-xl backdrop-blur-sm bg-white/80 p-6 rounded-xl shadow-lg">
              <SearchForm onSearch={handleSearch} isSearching={isSearching} />
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-wedding-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute top-1/2 right-24 w-72 h-72 bg-wedding-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 right-12 w-72 h-72 bg-wedding-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
          </div>
        </div>
      </div>
    </section>
  );
};