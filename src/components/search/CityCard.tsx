import { useNavigate } from "react-router-dom";

interface CityCardProps {
  city: string;
  state: string;
  vendorCount: number;
}

export const CityCard = ({ city, state, vendorCount }: CityCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search/${state.replace(/\s+/g, '-').toLowerCase()}/${city.replace(/\s+/g, '-').toLowerCase()}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <h3 className="text-xl font-semibold text-wedding-text mb-2">{city}</h3>
      <p className="text-gray-600">
        {vendorCount} {vendorCount === 1 ? 'Vendor' : 'Vendors'} Available
      </p>
      <div className="mt-4">
        <span className="text-wedding-primary text-sm font-medium">
          View Vendors →
        </span>
      </div>
    </div>
  );
};
