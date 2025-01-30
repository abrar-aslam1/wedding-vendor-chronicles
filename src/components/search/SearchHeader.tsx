import { useParams } from "react-router-dom";

interface SearchHeaderProps {
  subcategory?: string;
}

export const SearchHeader = ({ subcategory }: SearchHeaderProps) => {
  const { category, city, state } = useParams();
  
  const cleanCategory = category?.replace('top-20/', '').replace(/-/g, ' ');
  const displayLocation = city && state ? ` in ${city}, ${state}` : '';
  
  const title = subcategory 
    ? `${subcategory} ${cleanCategory}${displayLocation}`
    : `Top 20 ${cleanCategory}${displayLocation}`;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-wedding-text capitalize">
        {title}
      </h1>
      <p className="text-gray-600 mt-2">
        Find the best wedding vendors in your area
      </p>
    </div>
  );
};