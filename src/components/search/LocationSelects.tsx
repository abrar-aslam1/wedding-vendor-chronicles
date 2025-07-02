import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStates, useCities } from "@/hooks/useLocations";
import { Loader2 } from "lucide-react";

interface LocationSelectsProps {
  selectedState: string;
  selectedCity: string;
  setSelectedState: (value: string) => void;
  setSelectedCity: (value: string) => void;
  isSearching: boolean;
}

export const LocationSelects = ({
  selectedState,
  selectedCity,
  setSelectedState,
  setSelectedCity,
  isSearching,
}: LocationSelectsProps) => {
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(selectedState);

  return (
    <>
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
        disabled={isSearching || statesLoading}
      >
        <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
          {statesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading states...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select state" />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {states.map((state) => (
            <SelectItem key={state.location_code} value={state.location_name}>
              {state.location_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCity}
        onValueChange={setSelectedCity}
        disabled={!selectedState || isSearching || citiesLoading}
      >
        <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
          {citiesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading cities...</span>
            </div>
          ) : (
            <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {cities.map((city) => (
            <SelectItem key={city.location_code} value={city.location_name}>
              {city.location_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};