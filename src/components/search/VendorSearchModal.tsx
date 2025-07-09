import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users, Building } from "lucide-react";
import { getStateBySlug } from "@/config/states";

interface VendorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorySlug: string;
  categoryName: string;
  state: string;
  stateName: string;
  popularCities: string[];
}

export const VendorSearchModal = ({
  isOpen,
  onClose,
  categorySlug,
  categoryName,
  state,
  stateName,
  popularCities
}: VendorSearchModalProps) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const stateInfo = getStateBySlug(state);

  const handleStateWideSearch = () => {
    navigate(`/top-20/${categorySlug}/all-cities/${state}`);
    onClose();
  };

  const handleCitySearch = (city: string) => {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    navigate(`/top-20/${categorySlug}/${citySlug}/${state}`);
    onClose();
  };

  const handleCustomCitySearch = () => {
    if (selectedCity.trim()) {
      const citySlug = selectedCity.toLowerCase().replace(/\s+/g, '-');
      navigate(`/top-20/${categorySlug}/${citySlug}/${state}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-wedding-text">
            Find {categoryName} in {stateName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Options Header */}
          <div className="text-center">
            <p className="text-gray-600">
              Choose how you'd like to search for {categoryName.toLowerCase()} in {stateName}
            </p>
          </div>

          {/* State-wide Search Option */}
          <Card className="border-2 border-wedding-primary/20 hover:border-wedding-primary/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-wedding-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-wedding-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-wedding-text mb-2">
                    Search All of {stateName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse {categoryName.toLowerCase()} from across the entire state. 
                    You can filter by city later.
                  </p>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Most comprehensive results
                    </Badge>
                    {stateInfo && (
                      <Badge variant="outline" className="text-xs">
                        Peak Season: {stateInfo.weddingSeasonPeak}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={handleStateWideSearch}
                    className="w-full bg-wedding-primary hover:bg-wedding-primary/90"
                  >
                    Search All {stateName} {categoryName}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* City-specific Search Options */}
          <div>
            <h3 className="text-lg font-semibold text-wedding-text mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Or Search a Specific City
            </h3>
            
            {/* Popular Cities */}
            {popularCities.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Popular cities in {stateName}:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {popularCities.slice(0, 9).map((city) => (
                    <Button
                      key={city}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCitySearch(city)}
                      className="text-left justify-start hover:bg-wedding-primary/10 min-h-[44px] whitespace-nowrap overflow-hidden text-ellipsis"
                      title={city}
                    >
                      <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{city}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom City Input */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Enter city name in ${stateName}...`}
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wedding-primary focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomCitySearch();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleCustomCitySearch}
                    disabled={!selectedCity.trim()}
                    size="sm"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter any city name in {stateName} to search for {categoryName.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          {stateInfo && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-wedding-text mb-2">
                  Popular {categoryName} Styles in {stateName}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {stateInfo.popularVenueTypes.slice(0, 4).map(venueType => (
                    <Badge key={venueType} variant="secondary" className="text-xs">
                      {venueType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
