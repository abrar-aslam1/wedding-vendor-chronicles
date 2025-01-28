import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationCodes } from "@/utils/dataForSeoApi";

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
        disabled={!selectedState || isSearching}
      >
        <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
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
    </>
  );
};