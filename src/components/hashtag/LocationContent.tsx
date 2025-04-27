import React from "react";
import { Link } from "react-router-dom";
import { getLocationData, getLocationWeddingStats, getAllStatesSlugs, getCitySlugsForState } from "@/config/hashtag-locations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Building, ChevronRight } from "lucide-react";

interface LocationContentProps {
  stateSlug?: string;
  citySlug?: string;
}

const LocationContent: React.FC<LocationContentProps> = ({
  stateSlug,
  citySlug
}) => {
  // Get location data
  const { state, city } = getLocationData(stateSlug, citySlug);
  
  // Get wedding statistics for the location
  const stats = stateSlug ? getLocationWeddingStats(stateSlug, citySlug) : null;
  
  // If no state is provided, show a list of states
  if (!stateSlug) {
    const statesSlugs = getAllStatesSlugs();
    
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Wedding Hashtag Generator by Location</h1>
        <p className="text-gray-600 mb-8">
          Create location-specific wedding hashtags that celebrate where your special day will take place. 
          Choose your state below to get started with personalized hashtag suggestions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {statesSlugs.map(slug => {
            const { state } = getLocationData(slug);
            if (!state) return null;
            
            return (
              <Card key={slug} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{state.stateName}</CardTitle>
                  <CardDescription>{state.stateNickname || "Wedding Hashtags"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/tools/wedding-hashtag-generator/states/${slug}`}>
                    <Button variant="outline" className="w-full">
                      View {state.stateName} Hashtags
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  
  // If a state is provided but no city, show a list of cities in that state
  if (stateSlug && !citySlug && state) {
    const citySlugs = getCitySlugsForState(stateSlug);
    
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {state.stateName} Wedding Hashtag Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Create the perfect wedding hashtag for your {state.stateName} wedding. Our generator creates unique, 
          personalized hashtags that incorporate {state.stateName}'s unique character and charm.
        </p>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Wedding Statistics for {state.stateName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Popular Months</h3>
                <p className="text-gray-700">{stats?.popularMonths.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Popular Venues</h3>
                <p className="text-gray-700">{stats?.popularVenues.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Average Guest Count</h3>
                <p className="text-gray-700">{stats?.averageGuestCount} guests</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Average Cost</h3>
                <p className="text-gray-700">{stats?.averageCost}</p>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Choose a City in {state.stateName}</h2>
        <p className="text-gray-600 mb-6">
          Select a city to get even more personalized wedding hashtag suggestions that incorporate local landmarks and terminology.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {citySlugs.map(citySlug => {
            const { city } = getLocationData(stateSlug, citySlug);
            if (!city) return null;
            
            return (
              <Card key={citySlug} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{city.cityName}</CardTitle>
                  <CardDescription>
                    {city.nicknames && city.nicknames.length > 0 
                      ? `Known as: ${city.nicknames[0]}`
                      : "Wedding Hashtags"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/tools/wedding-hashtag-generator/states/${stateSlug}/${citySlug}`}>
                    <Button variant="outline" className="w-full">
                      {city.cityName} Hashtags
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  
  // If both state and city are provided, show location-specific content
  if (stateSlug && citySlug && state && city) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {city.cityName}, {state.stateName} Wedding Hashtag Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Create the perfect wedding hashtag for your {city.cityName} wedding. Our generator creates unique, 
          personalized hashtags that incorporate {city.cityName}'s landmarks, nicknames, and local terminology.
        </p>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Wedding Statistics for {city.cityName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Popular Months</h3>
                <p className="text-gray-700">{stats?.popularMonths.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Popular Venues</h3>
                <p className="text-gray-700">{stats?.popularVenues.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Average Guest Count</h3>
                <p className="text-gray-700">{stats?.averageGuestCount} guests</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Average Cost</h3>
                <p className="text-gray-700">{stats?.averageCost}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{city.cityName} Wedding Hashtag Ideas</h2>
          <p className="text-gray-600 mb-4">
            Here are some ideas for incorporating {city.cityName} into your wedding hashtag:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {city.landmarks && city.landmarks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Landmark-Based Hashtags</CardTitle>
                  <CardDescription>Incorporate famous {city.cityName} landmarks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {city.landmarks.map((landmark, index) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">#{landmark}Wedding</span> - Celebrate your wedding at or near {landmark}
                      </li>
                    ))}
                    <li className="text-gray-700">
                      <span className="font-medium">#YourNamesAt{city.landmarks[0]}</span> - Personalize with your names
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {city.nicknames && city.nicknames.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nickname-Based Hashtags</CardTitle>
                  <CardDescription>Use {city.cityName}'s popular nicknames</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {city.nicknames.map((nickname, index) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">#{nickname.replace(/\s+/g, "")}Wedding</span> - Using the nickname "{nickname}"
                      </li>
                    ))}
                    <li className="text-gray-700">
                      <span className="font-medium">#YourNamesIn{city.nicknames[0].replace(/\s+/g, "")}</span> - Personalize with your names
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">
            Use our generator below to create personalized {city.cityName} wedding hashtags with your names!
          </p>
        </div>
      </div>
    );
  }
  
  // Fallback content if location data is not found
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Wedding Hashtag Generator</h1>
      <p className="text-gray-600 mb-8">
        Create unique, personalized hashtags for your wedding in seconds. Our free tool helps couples create memorable hashtags for capturing all your special moments.
      </p>
    </div>
  );
};

export default LocationContent;
