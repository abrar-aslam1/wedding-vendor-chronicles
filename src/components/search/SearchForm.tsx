import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locationCodes } from "@/utils/dataForSeoApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface SearchFormProps {
  onSearch: (category: string, state: string, city: string) => Promise<void>;
  isSearching: boolean;
  preselectedCategory?: string;
}

export const SearchForm = ({ onSearch, isSearching, preselectedCategory }: SearchFormProps) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || "");

  const handleSubmit = async () => {
    await onSearch(selectedCategory, selectedState, selectedCity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {!preselectedCategory && (
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={isSearching || !!preselectedCategory}
          >
            <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
              <SelectValue placeholder="What vendor are you looking for?" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
      </div>
      
      <Button 
        className="w-full h-12 bg-wedding-primary hover:bg-wedding-accent transition-all duration-300 rounded-xl"
        onClick={handleSubmit}
        disabled={isSearching || (!preselectedCategory && !selectedCategory) || !selectedState || !selectedCity}
      >
        <Search className="mr-2 h-5 w-5" />
        {isSearching ? "Searching..." : "Find Vendors"}
      </Button>
    </div>
  );
};