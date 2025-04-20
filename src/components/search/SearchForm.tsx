import { useState, useEffect } from "react";
import { CategorySelect } from "./CategorySelect";
import { LocationSelects } from "./LocationSelects";
import { SearchButton } from "./SearchButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const fetchSubcategories = async () => {
      const normalizedCategory = selectedCategory.toLowerCase();
      console.log('Category being checked:', normalizedCategory);
      
      if (normalizedCategory === 'caterers') {
        console.log('Setting cuisine types for caterers...');
        
        // Use hardcoded subcategories for now
        const cuisineTypes = [
          { id: '1', name: 'American', description: 'American cuisine with burgers, steaks, and comfort food' },
          { id: '2', name: 'Italian', description: 'Italian cuisine featuring pasta, pizza, and more' },
          { id: '3', name: 'Mexican', description: 'Mexican cuisine with tacos, enchiladas, and traditional dishes' },
          { id: '4', name: 'Indian', description: 'Indian cuisine with curry, tandoori, and diverse regional dishes' },
          { id: '5', name: 'Chinese', description: 'Chinese cuisine with stir-fry, dim sum, and regional specialties' },
          { id: '6', name: 'Mediterranean', description: 'Mediterranean cuisine featuring healthy dishes from Greece, Turkey, and more' },
          { id: '7', name: 'Japanese', description: 'Japanese cuisine with sushi, ramen, and traditional dishes' },
          { id: '8', name: 'Thai', description: 'Thai cuisine with flavorful curries, noodles, and aromatic dishes' },
          { id: '9', name: 'French', description: 'French cuisine with elegant dishes, pastries, and culinary traditions' },
          { id: '10', name: 'Middle Eastern', description: 'Middle Eastern cuisine with falafel, hummus, and traditional dishes' }
        ];
        
        setSubcategories(cuisineTypes);
      } else {
        setSubcategories([]);
        setSelectedSubcategory("");
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

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <CategorySelect
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          isSearching={isSearching}
          preselectedCategory={preselectedCategory}
        />
        
        {selectedCategory.toLowerCase() === 'caterers' && subcategories.length > 0 && (
          <div className="space-y-3">
            <label className="block text-base font-medium text-wedding-text">
              Select Cuisine Type for Catering
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Choose a cuisine to see caterers specializing in that type of food
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
          (selectedCategory.toLowerCase() === 'caterers' && !selectedSubcategory)
        }
        onClick={handleSubmit}
      />
    </div>
  );
};
