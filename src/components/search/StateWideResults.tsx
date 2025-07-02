import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Filter, Grid, List, ChevronDown } from "lucide-react";
import { SearchResult } from "@/types/search";
import { SearchResults } from "./SearchResults";
import { getStateBySlug } from "@/config/states";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StateWideResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  state: string;
  category: string;
  subcategory?: string;
}

export const StateWideResults = ({ 
  results, 
  isSearching, 
  state, 
  category,
  subcategory 
}: StateWideResultsProps) => {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const stateInfo = getStateBySlug(state);
  const stateName = stateInfo?.name || state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryDisplay = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Get unique cities from results
  const availableCities = Array.from(new Set(
    results
      .map(result => result.city)
      .filter(Boolean)
      .sort()
  ));

  // Filter results by selected city
  const filteredResults = selectedCity === "all" 
    ? results 
    : results.filter(result => result.city?.toLowerCase() === selectedCity.toLowerCase());

  // Group results by city for better organization
  const resultsByCity = results.reduce((acc, result) => {
    const city = result.city || 'Other';
    if (!acc[city]) acc[city] = [];
    acc[city].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const majorCities = stateInfo?.majorCities || [];
  const popularCities = majorCities.filter(city => 
    availableCities.some(availableCity => 
      availableCity.toLowerCase().includes(city.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-wedding-text">
            {subcategory ? `${subcategory} ` : ''}{categoryDisplay} in {stateName}
          </h1>
          <p className="text-gray-600 text-lg">
            {isSearching 
              ? `Searching for ${categoryDisplay.toLowerCase()} across ${stateName}...`
              : `Found ${filteredResults.length} ${categoryDisplay.toLowerCase()} ${selectedCity !== "all" ? `in ${selectedCity}` : `across ${stateName}`}`
            }
          </p>
        </div>

        {/* Quick Stats */}
        {!isSearching && results.length > 0 && (
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{availableCities.length} cities covered</span>
            </div>
            {stateInfo && (
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  Peak Season: {stateInfo.weddingSeasonPeak}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* City Filter Bar */}
      {!isSearching && availableCities.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by city:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCity === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCity("all")}
                  className="text-xs"
                >
                  All Cities ({results.length})
                </Button>
                
                {/* Show popular cities first */}
                {popularCities.slice(0, 4).map(city => {
                  const cityResults = results.filter(r => 
                    r.city?.toLowerCase().includes(city.toLowerCase())
                  );
                  if (cityResults.length === 0) return null;
                  
                  return (
                    <Button
                      key={city}
                      variant={selectedCity.toLowerCase() === city.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCity(city)}
                      className="text-xs"
                    >
                      {city} ({cityResults.length})
                    </Button>
                  );
                })}
                
                {/* More cities dropdown if there are many */}
                {availableCities.length > 5 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        More Cities <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {availableCities
                        .filter(city => !popularCities.includes(city))
                        .map(city => {
                          const cityResults = results.filter(r => 
                            r.city?.toLowerCase() === city.toLowerCase()
                          );
                          return (
                            <DropdownMenuItem
                              key={city}
                              onClick={() => setSelectedCity(city)}
                            >
                              {city} ({cityResults.length})
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      <SearchResults 
        results={filteredResults} 
        isSearching={isSearching} 
        subcategory={subcategory}
      />

      {/* Popular Venue Types for State */}
      {!isSearching && results.length > 0 && stateInfo && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-wedding-text mb-3">
              Popular Wedding Styles in {stateName}
            </h3>
            <div className="flex flex-wrap gap-2">
              {stateInfo.popularVenueTypes.map(venueType => (
                <Badge key={venueType} variant="secondary" className="text-xs">
                  {venueType}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Peak wedding season in {stateName}: {stateInfo.weddingSeasonPeak}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
