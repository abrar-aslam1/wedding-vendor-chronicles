import { useParams } from "react-router-dom";

interface SearchHeaderProps {
  subcategory?: string;
}

export const SearchHeader = ({ subcategory }: SearchHeaderProps) => {
  const { category, city, state } = useParams();
  
  const cleanCategory = category?.replace('top-20/', '').replace(/-/g, ' ');
  const displayLocation = city && state ? ` in ${city}, ${state}` : '';
  
  // Format subcategory for display with proper capitalization
  const formattedSubcategory = subcategory 
    ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) 
    : '';
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-wedding-text capitalize">
        {subcategory 
          ? `${formattedSubcategory} Cuisine ${cleanCategory}${displayLocation}`
          : `Top 20 ${cleanCategory}${displayLocation}`
        }
      </h1>
      <p className="text-gray-600 mt-2">
        {subcategory
          ? `Find the best ${formattedSubcategory} cuisine caterers for your wedding`
          : "Find the best wedding vendors in your area"
        }
      </p>
    </div>
  );
};
