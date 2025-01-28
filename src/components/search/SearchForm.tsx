import { useState } from "react";
import { CategorySelect } from "./CategorySelect";
import { LocationSelects } from "./LocationSelects";
import { SearchButton } from "./SearchButton";

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
    const categoryToUse = preselectedCategory || selectedCategory;
    console.log('SearchForm submitting:', { categoryToUse, selectedState, selectedCity });
    await onSearch(categoryToUse, selectedState, selectedCity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <CategorySelect
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          isSearching={isSearching}
          preselectedCategory={preselectedCategory}
        />
        
        <LocationSelects
          selectedState={selectedState}
          selectedCity={selectedCity}
          setSelectedState={setSelectedState}
          setSelectedCity={setSelectedCity}
          isSearching={isSearching}
        />
      </div>
      
      <SearchButton
        isSearching={isSearching}
        disabled={isSearching || (!preselectedCategory && !selectedCategory) || !selectedState || !selectedCity}
        onClick={handleSubmit}
      />
    </div>
  );
};