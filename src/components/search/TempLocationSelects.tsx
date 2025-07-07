import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_STATES } from "@/config/states";

interface TempLocationSelectsProps {
  selectedState: string;
  selectedCity: string;
  setSelectedState: (value: string) => void;
  setSelectedCity: (value: string) => void;
  isSearching: boolean;
}

export const TempLocationSelects = ({
  selectedState,
  selectedCity,
  setSelectedState,
  setSelectedCity,
  isSearching,
}: TempLocationSelectsProps) => {
  // Find the selected state object to get its cities
  const selectedStateObj = ALL_STATES.find(state => state.name === selectedState);
  const cities = selectedStateObj ? selectedStateObj.majorCities : [];

  // Sort states alphabetically for better UX
  const sortedStates = [...ALL_STATES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
        disabled={isSearching}
      >
        <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
          <SelectValue placeholder="Select state" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {sortedStates.map((state) => (
            <SelectItem key={state.code} value={state.name}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCity}
        onValueChange={setSelectedCity}
        disabled={!selectedState || isSearching}
      >
        <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
          <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};