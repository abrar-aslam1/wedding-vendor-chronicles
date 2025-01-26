import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/search/LocationSearch";
import { searchVendors } from "@/services/dataForSeoService";
import { supabase } from "@/integrations/supabase/client";

// Fixed US location code
const US_LOCATION_CODE = 2840;

export const SearchSection = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity("");
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleSearch = async () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Location Required",
        description: "Please select both state and city before searching.",
        variant: "destructive",
      });
      return;
    }
  };

  const handleSearch = async (category: string) => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Location Required",
        description: "Please select both state and city before searching.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Navigate to search page with the category
      navigate(`/search/${category}`);
      
      // Include state and city in the search query
      const searchQuery = `${category} in ${selectedCity}, ${selectedState}`;
      console.log('Search query:', searchQuery);
      
      // Always use US location code (2840) for searches
      const results = await searchVendors(searchQuery, US_LOCATION_CODE);
      console.log('Raw search results:', results);
      
      if (!results?.tasks?.[0]?.result?.[0]?.items) {
        throw new Error("No results found");
      }

      const processedResults = results.tasks[0].result[0].items.map((item: any) => ({
        title: item.title,
        description: item.description,
        rating: {
          rating_value: item.rating?.rating_value,
          rating_count: item.rating?.rating_count,
        },
        address: item.address,
        url: item.url,
        place_id: item.place_id,
      }));

      console.log('Processed results:', processedResults);

      // Save search results to Supabase using fixed US location code
      const { error: saveError } = await supabase
        .from('vendor_searches')
        .insert({
          keyword: searchQuery,
          location_code: US_LOCATION_CODE,
          search_results: processedResults,
          user_id: session.user.id
        });

      if (saveError) {
        console.error('Error saving search:', saveError);
        throw saveError;
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Find Local Wedding Vendors</h2>
        <div className="space-y-6">
          <LocationSearch
            selectedState={selectedState}
            selectedCity={selectedCity}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            isSearching={isSearching}
            onSearch={() => {}}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSearch("wedding-planners")}
              disabled={isSearching}
            >
              Wedding Planners
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSearch("wedding-photographers")}
              disabled={isSearching}
            >
              Photographers
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSearch("wedding-venues")}
              disabled={isSearching}
            >
              Venues
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};