import { useState, useEffect } from "react";
import { CategorySelect } from "./CategorySelect";
import { TempLocationSelects } from "./TempLocationSelects";
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

  // Helper function to normalize category names for subcategory lookup
  const normalizeCategoryForSubcategories = (categoryName: string): string => {
    const normalized = categoryName.toLowerCase();
    // Handle common variations
    if (normalized === 'photographer' || normalized === 'photographers') return 'photographers';
    if (normalized === 'wedding planner' || normalized === 'wedding-planners' || normalized === 'wedding planners') return 'wedding-planners';
    if (normalized === 'dj' || normalized === 'djs' || normalized === 'djs & bands' || normalized === 'djs and bands') return 'djs-and-bands';
    if (normalized === 'videographer' || normalized === 'videographers') return 'videographers';
    if (normalized === 'cake designer' || normalized === 'cake designers' || normalized === 'cake-designers') return 'cake-designers';
    if (normalized === 'bridal shop' || normalized === 'bridal shops' || normalized === 'bridal-shops') return 'bridal-shops';
    if (normalized === 'makeup artist' || normalized === 'makeup artists' || normalized === 'makeup-artists') return 'makeup-artists';
    if (normalized === 'hair stylist' || normalized === 'hair stylists' || normalized === 'hair-stylists') return 'hair-stylists';
    if (normalized === 'florist' || normalized === 'florists') return 'florists';
    if (normalized === 'venue' || normalized === 'venues') return 'venues';
    if (normalized === 'caterer' || normalized === 'caterers') return 'caterers';
    if (normalized === 'wedding decorator' || normalized === 'wedding decorators' || normalized === 'wedding-decorators') return 'wedding-decorators';
    if (normalized === 'cart' || normalized === 'carts' || normalized === 'mobile carts') return 'carts';
    return displayNameToSlug(categoryName);
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) return;
      
      // Use the normalized category name for subcategory lookup
      const categoryKey = normalizeCategoryForSubcategories(selectedCategory);
      console.log('Category being checked:', selectedCategory);
      console.log('Normalized category key:', categoryKey);
      
      // Reset subcategories and selected subcategory
      setSubcategories([]);
      setSelectedSubcategory("");
      
      // Debug: Log all available categories in hardcodedSubcategories
      console.log('Available categories in hardcodedSubcategories:', Object.keys(hardcodedSubcategories));
      
      // Check if we have hardcoded subcategories for this category
      if (categoryKey && hardcodedSubcategories[categoryKey]) {
        console.log(`✅ Setting subcategories for ${categoryKey}...`);
        const categorySubcategories = hardcodedSubcategories[categoryKey];
        console.log('Subcategories found:', categorySubcategories.length);
        setSubcategories(categorySubcategories);
      } else {
        console.log(`❌ No subcategories found for category key: ${categoryKey}`);
        console.log('Available keys:', Object.keys(hardcodedSubcategories));
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
              {selectedCategory.toLowerCase().includes('caterer') 
                ? 'Select Cuisine Type for Catering'
                : selectedCategory.toLowerCase().includes('cart')
                ? 'Select Cart Type'
                : selectedCategory.toLowerCase().includes('wedding-planner') || selectedCategory.toLowerCase().includes('wedding planner')
                ? 'Select Planning Service Type'
                : selectedCategory.toLowerCase().includes('photographer')
                ? 'Select Photography Style'
                : selectedCategory.toLowerCase().includes('videographer')
                ? 'Select Videography Style'
                : selectedCategory.toLowerCase().includes('florist')
                ? 'Select Floral Style'
                : selectedCategory.toLowerCase().includes('venue')
                ? 'Select Venue Type'
                : selectedCategory.toLowerCase().includes('dj') || selectedCategory.toLowerCase().includes('band')
                ? 'Select Entertainment Type'
                : selectedCategory.toLowerCase().includes('cake')
                ? 'Select Cake Style'
                : selectedCategory.toLowerCase().includes('bridal')
                ? 'Select Dress Type'
                : selectedCategory.toLowerCase().includes('makeup')
                ? 'Select Makeup Style'
                : selectedCategory.toLowerCase().includes('hair')
                ? 'Select Hair Style'
                : selectedCategory.toLowerCase().includes('decorator') || selectedCategory.toLowerCase().includes('decoration')
                ? 'Select Decoration Style'
                : `Select ${selectedCategory} Type`}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {selectedCategory.toLowerCase().includes('caterer') 
                ? 'Choose a cuisine to see caterers specializing in that type of food'
                : selectedCategory.toLowerCase().includes('cart')
                ? 'Choose a cart type to find mobile services perfect for your wedding'
                : selectedCategory.toLowerCase().includes('photographer')
                ? 'Choose a photography style to find photographers specializing in that approach'
                : selectedCategory.toLowerCase().includes('videographer')
                ? 'Choose a videography style to find videographers with that specialty'
                : selectedCategory.toLowerCase().includes('venue')
                ? 'Choose a venue type to find locations perfect for your wedding style'
                : selectedCategory.toLowerCase().includes('florist')
                ? 'Choose a floral style to find florists who match your wedding aesthetic'
                : `Choose a type to see ${selectedCategory.toLowerCase()} specializing in that area`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant={selectedSubcategory === subcategory.name ? "default" : "outline"}
                  className={`w-full text-sm py-3 px-4 min-h-[44px] whitespace-nowrap overflow-hidden text-ellipsis ${
                    selectedSubcategory === subcategory.name 
                      ? "bg-wedding-primary text-white shadow-md" 
                      : "hover:bg-wedding-primary/10"
                  }`}
                  onClick={() => setSelectedSubcategory(subcategory.name)}
                  title={subcategory.name}
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <TempLocationSelects
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
