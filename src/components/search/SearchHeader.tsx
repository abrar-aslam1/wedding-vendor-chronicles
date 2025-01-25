import { useParams } from "react-router-dom";

export const SearchHeader = () => {
  const { category } = useParams();
  
  return (
    <h1 className="text-3xl font-bold mb-8 text-wedding-text capitalize">
      {category?.replace(/-/g, " ")}
    </h1>
  );
};