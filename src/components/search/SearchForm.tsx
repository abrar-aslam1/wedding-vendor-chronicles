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
      if (selectedCategory === 'caterers') {
        console.log('Fetching subcategories for caterers...');
        const { data, error } = await supabase
          .from('vendor_subcategories')
          .select('*')
          .eq('category', 'caterers');

        if (error) {
          console.error('Error fetching subcategories:', error);
          return;
        }

        console.log('Fetched subcategories:', data);
        setSubcategories(data);
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
        
        {selectedCategory === 'caterers' && subcategories.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Cuisine Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant={selectedSubcategory === subcategory.name ? "default" : "outline"}
                  className="w-full text-sm"
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
          (selectedCategory === 'caterers' && !selectedSubcategory)
        }
        onClick={handleSubmit}
      />
    </div>
  );
};