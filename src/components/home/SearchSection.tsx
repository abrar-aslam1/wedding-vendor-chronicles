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

const categories = [
  "Wedding Planners",
  "Photographers",
  "Videographers",
  "Florists",
  "Caterers",
  "Venues",
  "DJs & Bands",
  "Cake Designers",
  "Bridal Shops",
  "Makeup Artists",
  "Hair Stylists",
];

export const SearchSection = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const formatUrlSegment = (text: string) => {
    return text.toLowerCase().replace(/\s+&?\s+/g, "_");
  };

  const handleSearch = async () => {
    if (!selectedState || !selectedCity || !selectedCategory) {
      toast({
        title: "Please select all fields",
        description: "Category, state and city are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
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

      // Format the URL segments
      const formattedCategory = formatUrlSegment(selectedCategory);
      const formattedCity = formatUrlSegment(selectedCity);
      const formattedState = formatUrlSegment(selectedState);

      // Navigate to the new URL format
      navigate(`/top-20/${formattedCategory}/${formattedCity}/${formattedState}`);
      
      const locationString = `${selectedCity}, ${selectedState}`;
      const results = await searchVendors(selectedCategory.toLowerCase(), locationString);
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
        description: `Found ${processedResults.length} vendors in ${locationString}`,
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
    <section className="py-8 md:py-16 bg-wedding-light relative -mt-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4 p-4 md:p-6 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedState}
                onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedCity("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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
          
          <div className="mt-4 md:mt-8">
            <SearchResults results={searchResults} isSearching={isSearching} />
          </div>
        </div>
      </div>
    </section>
  );
};
