import { useParams } from "react-router-dom";

export const SearchHeader = () => {
  const { category } = useParams();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-wedding-text capitalize">
        {category?.replace(/-/g, " ")}
      </h1>
      <p className="text-gray-600 mt-2">
        Find the best wedding vendors in your area
      </p>
    </div>
  );
};