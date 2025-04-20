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
      
      setSubcategories([]);
      setSelectedSubcategory("");
      
      if (normalizedCategory === 'caterers') {
        console.log('Fetching cuisine types for caterers...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('cuisine_types')
            .select('id, name, description')
            .eq('category', 'caterers');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching cuisine types:', error);
          }
        } catch (err) {
          console.error('Error fetching cuisine types:', err);
        }
      } 
      else if (normalizedCategory === 'wedding-planners') {
        console.log('Fetching planner types...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('planner_types')
            .select('id, name, description')
            .eq('category', 'wedding-planners');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching planner types:', error);
          }
        } catch (err) {
          console.error('Error fetching planner types:', err);
        }
      }
      else if (normalizedCategory === 'photographers') {
        console.log('Fetching photographer types...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('photographer_types')
            .select('id, name, description')
            .eq('category', 'photographers');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching photographer types:', error);
          }
        } catch (err) {
          console.error('Error fetching photographer types:', err);
        }
      }
      else if (normalizedCategory === 'florists') {
        console.log('Fetching florist types...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('florist_types')
            .select('id, name, description')
            .eq('category', 'florists');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching florist types:', error);
          }
        } catch (err) {
          console.error('Error fetching florist types:', err);
        }
      }
      else if (normalizedCategory === 'venues') {
        console.log('Fetching venue types...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('venue_types')
            .select('id, name, description')
            .eq('category', 'venues');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching venue types:', error);
          }
        } catch (err) {
          console.error('Error fetching venue types:', err);
        }
      }
      else if (normalizedCategory === 'djs-and-bands') {
        console.log('Fetching entertainment types...');
        
        try {
          // Use type assertion to bypass TypeScript errors
          const { data, error } = await (supabase as any)
            .from('entertainment_types')
            .select('id, name, description')
            .eq('category', 'djs-and-bands');
            
          if (data && !error) {
            setSubcategories(data);
          } else {
            console.error('Error fetching entertainment types:', error);
          }
        } catch (err) {
          console.error('Error fetching entertainment types:', err);
        }
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
