import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useStates, useCities } from "@/hooks/useLocations";

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
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(selectedState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedState} onValueChange={onStateChange} disabled={statesLoading}>
            <SelectTrigger>
              {statesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading states...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select state" />
              )}
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.location_code} value={state.location_name}>
                  {state.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={onCityChange} disabled={!selectedState || citiesLoading}>
            <SelectTrigger>
              {citiesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading cities...</span>
                </div>
              ) : (
                <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
              )}
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.location_code} value={city.location_name}>
                  {city.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full bg-wedding-primary hover:bg-wedding-accent"
          onClick={onSearch}
          disabled={isSearching || statesLoading}
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