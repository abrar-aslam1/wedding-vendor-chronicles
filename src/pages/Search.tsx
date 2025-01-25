import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { locationCodes, searchVendors } from "@/utils/dataForSeoApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Search() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
      const results = await searchVendors(category?.replace(/-/g, " ") || "", cityCode);
      
      // Extract the results from the API response
      const items = results?.tasks?.[0]?.result?.[0]?.items || [];
      setSearchResults(items);
      
      toast({
        title: "Search completed",
        description: `Found ${items.length} vendors`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-wedding-text">
        Find {category?.replace(/-/g, " ")}
      </h1>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Select Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Vendors'
              )}
            </Button>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <div className="mt-8 grid gap-6">
            {searchResults.map((vendor, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{vendor.title}</h3>
                  <p className="text-gray-600 mb-4">{vendor.description}</p>
                  {vendor.rating && (
                    <p className="text-sm text-gray-500">Rating: {vendor.rating}</p>
                  )}
                  {vendor.address && (
                    <p className="text-sm text-gray-500">{vendor.address}</p>
                  )}
                  {vendor.url && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(vendor.url, '_blank')}
                    >
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}