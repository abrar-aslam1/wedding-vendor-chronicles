import { useState } from "react";
import { StateCard } from "./StateCard";
import { ALL_STATES, getStatesByRegion, getPopularWeddingStates, US_REGIONS } from "@/config/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Search } from "lucide-react";

export const EnhancedStateGrid = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const popularStates = getPopularWeddingStates();
  
  // Filter states based on selected region and search term
  const getFilteredStates = () => {
    let filteredStates = selectedRegion === "all" 
      ? ALL_STATES 
      : getStatesByRegion(selectedRegion);
    
    if (searchTerm) {
      filteredStates = filteredStates.filter(state => 
        state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.majorCities.some(city => 
          city.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filteredStates;
  };

  const filteredStates = getFilteredStates();

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search states or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-primary focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRegion === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion("all")}
                className="text-xs"
              >
                All States ({ALL_STATES.length})
              </Button>
              {Object.values(US_REGIONS).map(region => {
                const regionStates = getStatesByRegion(region);
                return (
                  <Button
                    key={region}
                    variant={selectedRegion === region ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRegion(region)}
                    className="text-xs"
                  >
                    {region} ({regionStates.length})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Wedding Destinations */}
      {selectedRegion === "all" && !searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-wedding-primary" />
              Popular Wedding Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularStates.slice(0, 10).map((state) => (
                <StateCard
                  key={state.slug}
                  state={state.name}
                  vendorCount={0} // Will be populated from database
                  popularCities={state.majorCities}
                  averageRating={4.5}
                  isPopular={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-wedding-text">
            {selectedRegion === "all" 
              ? "All States" 
              : `${selectedRegion} States`}
            {searchTerm && ` matching "${searchTerm}"`}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredStates.length} {filteredStates.length === 1 ? 'state' : 'states'} available
          </p>
        </div>
        
        {selectedRegion !== "all" && (
          <Badge variant="outline" className="text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {selectedRegion} Region
          </Badge>
        )}
      </div>

      {/* States Grid */}
      {filteredStates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStates.map((state) => (
            <StateCard
              key={state.slug}
              state={state.name}
              vendorCount={0} // Will be populated from database
              popularCities={state.majorCities}
              averageRating={4.5}
              weddingSeasonPeak={state.weddingSeasonPeak}
              popularVenueTypes={state.popularVenueTypes}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No states found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No states match "${searchTerm}". Try a different search term.`
                : `No states found in the ${selectedRegion} region.`
              }
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedRegion("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Regional Information */}
      {selectedRegion !== "all" && filteredStates.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-wedding-text mb-3">
              About {selectedRegion} Weddings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-wedding-text mb-2">Popular Wedding Seasons:</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(
                    filteredStates.map(state => state.weddingSeasonPeak)
                  )).map(season => (
                    <Badge key={season} variant="secondary" className="text-xs">
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-wedding-text mb-2">Popular Venue Types:</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(
                    filteredStates.flatMap(state => state.popularVenueTypes)
                  )).slice(0, 6).map(venueType => (
                    <Badge key={venueType} variant="outline" className="text-xs">
                      {venueType}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
