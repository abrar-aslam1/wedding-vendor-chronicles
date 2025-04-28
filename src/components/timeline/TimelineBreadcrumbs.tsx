import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface TimelineBreadcrumbsProps {
  stateSlug?: string;
  citySlug?: string;
  className?: string;
}

const TimelineBreadcrumbs = ({ stateSlug, citySlug, className = "" }: TimelineBreadcrumbsProps) => {
  // Format state and city names for display
  const formatName = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className={`flex items-center text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="hover:text-wedding-primary">
            Home
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link to="/tools/wedding-timeline-generator" className="hover:text-wedding-primary">
            Wedding Timeline Generator
          </Link>
        </li>
        
        {stateSlug && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link 
              to={`/tools/wedding-timeline-generator/states/${stateSlug}`}
              className="hover:text-wedding-primary"
            >
              {formatName(stateSlug)}
            </Link>
          </li>
        )}
        
        {citySlug && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-700 font-medium">
              {formatName(citySlug)}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default TimelineBreadcrumbs;
