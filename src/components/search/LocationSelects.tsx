import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStates, useCities } from "@/hooks/useStaticLocations";
import { Loader2 } from "lucide-react";

interface LocationSelectsProps {
  selectedState: string;
  selectedCity: string;
  setSelectedState: (value: string) => void;
  setSelectedCity: (value: string) => void;
  isSearching: boolean;
  stateError?: string;
  cityError?: string;
}

export const LocationSelects = ({
  selectedState,
  selectedCity,
  setSelectedState,
  setSelectedCity,
  isSearching,
  stateError,
  cityError,
}: LocationSelectsProps) => {
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(selectedState);

  return (
    <>
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          State <span className="text-red-500">*</span>
        </label>
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
          {states.length === 0 && !statesLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No states available
            </div>
          ) : (
            states.map((state) => (
              <SelectItem key={state.location_code} value={state.location_name}>
                {state.location_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {stateError && (
        <p className="text-red-500 text-sm">{stateError}</p>
      )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          City <span className="text-red-500">*</span>
        </label>
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
          {cities.length === 0 && !citiesLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {selectedState ? "No cities found for this state" : "Please select a state first"}
            </div>
          ) : (
            cities.map((city) => (
              <SelectItem key={city.location_code} value={city.location_name}>
                {city.location_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {cityError && (
        <p className="text-red-500 text-sm">{cityError}</p>
      )}
      </div>
    </>
  );
};
