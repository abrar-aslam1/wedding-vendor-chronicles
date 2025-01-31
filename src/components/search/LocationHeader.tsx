import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface LocationHeaderProps {
  state?: string;
  city?: string;
}

export const LocationHeader = ({ state, city }: LocationHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link to="/" className="hover:text-wedding-primary">
          <Home className="w-4 h-4" />
        </Link>
        {state && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link 
              to={`/search/${state.toLowerCase()}`}
              className="hover:text-wedding-primary"
            >
              {state}
            </Link>
          </>
        )}
        {city && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-wedding-primary">{city}</span>
          </>
        )}
      </div>
      <h1 className="text-3xl font-heading text-wedding-text">
        {city 
          ? `Wedding Vendors in ${city}, ${state}`
          : state
          ? `Wedding Vendors in ${state}`
          : 'Find Wedding Vendors by Location'
        }
      </h1>
    </div>
  );
};