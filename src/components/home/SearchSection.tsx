import { useState } from "react";
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

export const SearchSection = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

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
      const cityCode = locationCodes[selectedState].cities[selectedCity];
      const results = await searchVendors("wedding planner", cityCode);
      
      toast({
        title: "Search completed",
        description: "Results have been saved to your history",
      });
    } catch (error) {
      toast({
        title: "Error searching vendors",
        description: error.message,
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
        </div>
      </div>
    </section>
  );
};