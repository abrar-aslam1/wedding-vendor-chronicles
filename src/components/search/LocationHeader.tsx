import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export const LocationHeader = () => {
  const { state, city } = useParams();

  return (
    <div className="mb-8">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-wedding-primary"
            >
              Home
            </Link>
          </li>
          
          {state && (
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link 
                  to={`/search/${state}`}
                  className="text-sm font-medium text-gray-700 hover:text-wedding-primary"
                >
                  {state}
                </Link>
              </div>
            </li>
          )}
          
          {city && (
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-wedding-primary">
                  {city}
                </span>
              </div>
            </li>
          )}
        </ol>
      </nav>
      
      <h1 className="text-3xl font-bold text-wedding-text mt-4">
        {city 
          ? `Wedding Vendors in ${city}, ${state}`
          : state 
            ? `Wedding Vendors in ${state}`
            : 'Find Wedding Vendors Near You'
        }
      </h1>
      <p className="text-gray-600 mt-2">
        Discover and connect with the best wedding vendors in your area
      </p>
    </div>
  );
};