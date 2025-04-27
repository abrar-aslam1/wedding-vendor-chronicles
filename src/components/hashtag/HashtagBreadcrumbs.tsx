import React from "react";
import { Link } from "react-router-dom";
import { getLocationData } from "@/config/hashtag-locations";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

interface HashtagBreadcrumbsProps {
  stateSlug?: string;
  citySlug?: string;
  className?: string;
}

const HashtagBreadcrumbs: React.FC<HashtagBreadcrumbsProps> = ({ 
  stateSlug, 
  citySlug,
  className = ""
}) => {
  // Get location data
  const { state, city } = getLocationData(stateSlug, citySlug);
  
  return (
    <Breadcrumb className={`mb-4 ${className}`}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/tools/wedding-hashtag-generator">
              Wedding Tools
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        {!stateSlug ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Wedding Hashtag Generator</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/tools/wedding-hashtag-generator">
                  Wedding Hashtag Generator
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/tools/wedding-hashtag-generator/states">
                  States
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            
            {!citySlug ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{state?.stateName || stateSlug}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/tools/wedding-hashtag-generator/states/${stateSlug}`}>
                      {state?.stateName || stateSlug}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  <BreadcrumbPage>{city?.cityName || citySlug}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default HashtagBreadcrumbs;
