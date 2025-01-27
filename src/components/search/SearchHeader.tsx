import { useParams } from "react-router-dom";

export const SearchHeader = () => {
  const { category, city, state } = useParams();
  
  const cleanCategory = category?.replace('top-20/', '').replace(/-/g, ' ');
  const displayLocation = city && state ? ` in ${city}, ${state}` : '';
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-wedding-text capitalize">
        {cleanCategory}{displayLocation}
      </h1>
      <p className="text-gray-600 mt-2">
        Find the best wedding vendors in your area
      </p>
    </div>
  );
};