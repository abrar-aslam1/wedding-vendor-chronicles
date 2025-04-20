import { useState, useEffect } from "react";
import { CategorySelect } from "./CategorySelect";
import { LocationSelects } from "./LocationSelects";
import { SearchButton } from "./SearchButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { subcategories as hardcodedSubcategories } from "@/config/subcategories";

interface SearchFormProps {
  onSearch: (category: string, state: string, city: string, subcategory?: string) => Promise<void>;
  isSearching: boolean;
  preselectedCategory?: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
}

export const SearchForm = ({ onSearch, isSearching, preselectedCategory }: SearchFormProps) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || "");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Helper function to convert display name to slug
  const displayNameToSlug = (displayName: string): string => {
    return displayName.toLowerCase().replace(/\s+&\s+/g, '-and-').replace(/\s+/g, '-');
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) return;
      
      // Convert display name to slug
      const categorySlug = displayNameToSlug(selectedCategory);
      console.log('Category being checked:', selectedCategory);
      console.log('Category slug:', categorySlug);
      
      // Reset subcategories and selected subcategory
      setSubcategories([]);
      setSelectedSubcategory("");
      
      // Debug: Log all available categories in hardcodedSubcategories
      console.log('Available categories in hardcodedSubcategories:', Object.keys(hardcodedSubcategories));
      
      // Check if we have hardcoded subcategories for this category
      if (categorySlug && hardcodedSubcategories[categorySlug]) {
        console.log(`Setting subcategories for ${categorySlug}...`);
        const categorySubcategories = hardcodedSubcategories[categorySlug];
        console.log('Subcategories:', categorySubcategories);
        setSubcategories(categorySubcategories);
      } else {
        console.log(`No subcategories found for category slug: ${categorySlug}`);
        console.log('Is category slug in hardcodedSubcategories?', categorySlug in hardcodedSubcategories);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const handleSubmit = async () => {
    const categoryToUse = preselectedCategory || selectedCategory;
    console.log('SearchForm submitting:', { 
      categoryToUse, 
      selectedState, 
      selectedCity,
      selectedSubcategory 
    });
    await onSearch(
      categoryToUse, 
      selectedState, 
      selectedCity, 
      selectedSubcategory
    );
  };

  // Debug: Log subcategories whenever they change
  useEffect(() => {
    console.log('Subcategories changed:', subcategories);
  }, [subcategories]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <CategorySelect
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          isSearching={isSearching}
          preselectedCategory={preselectedCategory}
        />
        
        {subcategories.length > 0 && (
          <div className="space-y-3">
            <label className="block text-base font-medium text-wedding-text">
              {selectedCategory.toLowerCase() === 'caterers' 
                ? 'Select Cuisine Type for Catering'
                : selectedCategory.toLowerCase() === 'wedding-planners'
                ? 'Select Planning Service Type'
                : selectedCategory.toLowerCase() === 'photographers'
                ? 'Select Photography Style'
                : selectedCategory.toLowerCase() === 'florists'
                ? 'Select Floral Style'
                : selectedCategory.toLowerCase() === 'venues'
                ? 'Select Venue Type'
                : selectedCategory.toLowerCase() === 'djs-and-bands'
                ? 'Select Entertainment Type'
                : `Select ${selectedCategory} Type`}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {selectedCategory.toLowerCase() === 'caterers' 
                ? 'Choose a cuisine to see caterers specializing in that type of food'
                : `Choose a type to see ${selectedCategory.toLowerCase()} specializing in that area`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant={selectedSubcategory === subcategory.name ? "default" : "outline"}
                  className={`w-full text-sm py-3 ${
                    selectedSubcategory === subcategory.name 
                      ? "bg-wedding-primary text-white shadow-md" 
                      : "hover:bg-wedding-primary/10"
                  }`}
                  onClick={() => setSelectedSubcategory(subcategory.name)}
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        
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
        disabled={
          isSearching || 
          (!preselectedCategory && !selectedCategory) || 
          !selectedState || 
          !selectedCity ||
          (subcategories.length > 0 && !selectedSubcategory)
        }
        onClick={handleSubmit}
      />
    </div>
  );
};
