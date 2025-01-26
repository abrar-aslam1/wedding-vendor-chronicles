import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locationCodes, searchVendors } from "@/utils/dataForSeoApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { SearchResults } from "@/components/search/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";

export const SearchSection = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Please select both state and city",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
      // Check authentication status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('Auth check:', { session, authError });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error("Authentication error occurred");
      }

      if (!session?.user) {
        console.log('No session or user found');
        toast({
          title: "Authentication required",
          description: "Please sign in to search for vendors",
          variant: "destructive",
        });
        return;
      }

      // Navigate to search page with the category
      navigate(`/search/wedding-planners`);
      
      const results = await searchVendors("wedding planners");
      console.log('Raw search results:', results);
      
      if (!results?.tasks?.[0]?.result?.[0]?.items) {
        console.log('No items found in search results');
        toast({
          title: "No results found",
          description: "Try searching in a different location",
          variant: "destructive",
        });
        return;
      }

      const items = results.tasks[0].result[0].items;
      console.log('Extracted items:', items);
      
      const processedResults = items.map((item: any) => ({
        title: item.title,
        description: item.snippet,
        rating: item.rating,
        address: item.address,
        url: item.url,
        place_id: item.place_id
      }));
      
      console.log('Processed results:', processedResults);
      setSearchResults(processedResults);
      
      toast({
        title: "Search completed",
        description: `Found ${processedResults.length} vendors`,
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
    <section className="py-16 bg-wedding-light relative -mt-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={selectedState}
                onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedCity("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(locationCodes).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {selectedState &&
                    Object.keys(locationCodes[selectedState].cities).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full bg-wedding-primary hover:bg-wedding-accent transition-all duration-300"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Searching..." : "Search Vendors"}
            </Button>
          </div>
          
          <div className="mt-8">
            <SearchResults results={searchResults} isSearching={isSearching} />
          </div>
        </div>
      </div>
    </section>
  );
};