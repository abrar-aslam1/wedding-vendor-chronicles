import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { locationCodes } from "@/utils/dataForSeoApi";

interface LocationSearchProps {
  selectedState: string;
  selectedCity: string;
  isSearching: boolean;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSearch: () => void;
}

export const LocationSearch = ({
  selectedState,
  selectedCity,
  isSearching,
  onStateChange,
  onCityChange,
  onSearch
}: LocationSearchProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedState} onValueChange={onStateChange}>
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

          <Select value={selectedCity} onValueChange={onCityChange} disabled={!selectedState}>
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
          className="w-full bg-wedding-primary hover:bg-wedding-accent"
          onClick={onSearch}
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
  );
};