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
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-white to-wedding-light">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-wedding-text leading-tight">
            Not sure which vendor to choose?
            <br />
            Perfect.
          </h1>
          
          <p className="text-xl text-wedding-text/80 max-w-2xl mx-auto">
            We'll help you find the best wedding vendors in your area
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          </div>

          <button 
            onClick={() => navigate("/search/all")}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-wedding-primary rounded-full hover:bg-wedding-accent transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            I'm Flexible
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-wedding-secondary rounded-full mix-blend-multiply filter blur-xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-wedding-primary rounded-full mix-blend-multiply filter blur-xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent to-white/50" />
      </div>
    </section>
  );
};