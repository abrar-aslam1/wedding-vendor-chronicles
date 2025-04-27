import React from 'react';
import { Link } from 'react-router-dom';
import { getState, getCity, City, State } from '@/config/hashtag-locations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Heart, Sparkles } from 'lucide-react';

interface LocationContentProps {
  stateSlug?: string;
  citySlug?: string;
}

export const LocationContent: React.FC<LocationContentProps> = ({ stateSlug, citySlug }) => {
  // If no state is provided, show a list of all states
  if (!stateSlug) {
    return <StatesList />;
  }

  // If state is provided but no city, show a list of cities in that state
  if (stateSlug && !citySlug) {
    return <CitiesList stateSlug={stateSlug} />;
  }

  // If both state and city are provided, show location-specific content
  const state = getState(stateSlug);
  const city = getCity(stateSlug, citySlug);

  if (!state || !city) {
    return <LocationNotFound />;
  }

  return (
    <div className="space-y-8">
      <LocationHeader state={state} city={city} />
      <LocationStats state={state} city={city} />
      <PopularVenues city={city} />
      <LocalHashtagIdeas state={state} city={city} />
      <WeddingTrends state={state} />
    </div>
  );
};

// Component to display a list of all states
const StatesList: React.FC = () => {
  // Import getAllStates at the top of the file
  const { getAllStates } = require('@/config/hashtag-locations');
  const states = getAllStates();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-wedding-primary mb-2">
          Wedding Hashtag Generator by Location
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create personalized wedding hashtags specific to your wedding location. 
          Select your state to get started with location-specific hashtag ideas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {states.map((state) => (
          <Link 
            key={state.slug} 
            to={`/tools/wedding-hashtag-generator/states/${state.slug}`}
            className="no-underline"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{state.name}</CardTitle>
                <CardDescription>
                  {Object.keys(state.cities).length} Cities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Avg. Wedding Cost: ${state.weddingStats.averageCost.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Peak Season: {state.weddingStats.peakSeason}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Heart className="h-4 w-4 mr-1" />
                  Popular Themes: {state.weddingStats.popularThemes.join(', ')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Component to display a list of cities in a state
const CitiesList: React.FC<{ stateSlug: string }> = ({ stateSlug }) => {
  const { getCitiesInState, getState } = require('@/config/hashtag-locations');
  const cities = getCitiesInState(stateSlug);
  const state = getState(stateSlug);

  if (!state) {
    return <LocationNotFound />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-wedding-primary mb-2">
            Wedding Hashtag Generator for {state.name}
          </h2>
          <p className="text-gray-600">
            Select your city to get location-specific wedding hashtag ideas.
          </p>
        </div>
        <Link to="/tools/wedding-hashtag-generator/states" className="mt-4 md:mt-0">
          <Button variant="outline">
            Back to All States
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          {state.name} Wedding Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium">Average Cost</p>
              <p className="text-blue-700">${state.weddingStats.averageCost.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium">Peak Wedding Season</p>
              <p className="text-blue-700">{state.weddingStats.peakSeason}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium">Popular Themes</p>
              <p className="text-blue-700">{state.weddingStats.popularThemes.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <Link 
            key={city.slug} 
            to={`/tools/wedding-hashtag-generator/states/${stateSlug}/${city.slug}`}
            className="no-underline"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{city.name}</CardTitle>
                <CardDescription>
                  {city.weddingVenues} Wedding Venues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Population: {city.population.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Heart className="h-4 w-4 mr-1" />
                  Popular Venues: {city.popularVenues[0]}, {city.popularVenues[1]}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Local Nicknames: {city.localNicknames.join(', ')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Component to display when a location is not found
const LocationNotFound: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-wedding-primary mb-4">
        Location Not Found
      </h2>
      <p className="text-gray-600 mb-6">
        We couldn't find the location you're looking for. Please select from one of our available locations.
      </p>
      <Link to="/tools/wedding-hashtag-generator/states">
        <Button>
          Browse Locations
        </Button>
      </Link>
    </div>
  );
};

// Component to display the location header
const LocationHeader: React.FC<{ state: State; city: City }> = ({ state, city }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h2 className="text-2xl font-bold text-wedding-primary mb-2">
          Wedding Hashtag Generator for {city.name}, {state.name}
        </h2>
        <p className="text-gray-600">
          Create personalized wedding hashtags for your {city.name} wedding with our free generator.
        </p>
      </div>
      <div className="flex space-x-3 mt-4 md:mt-0">
        <Link to={`/tools/wedding-hashtag-generator/states/${state.slug}`}>
          <Button variant="outline" size="sm">
            Back to {state.name}
          </Button>
        </Link>
        <Link to="/tools/wedding-hashtag-generator/states">
          <Button variant="outline" size="sm">
            All States
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Component to display location statistics
const LocationStats: React.FC<{ state: State; city: City }> = ({ state, city }) => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        {city.name} Wedding Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="font-medium">Wedding Venues</p>
            <p className="text-blue-700">{city.weddingVenues} venues</p>
          </div>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="font-medium">Average Wedding Cost</p>
            <p className="text-blue-700">${state.weddingStats.averageCost.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="font-medium">Peak Wedding Season</p>
            <p className="text-blue-700">{state.weddingStats.peakSeason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display popular venues
const PopularVenues: React.FC<{ city: City }> = ({ city }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">
        Popular Wedding Venues in {city.name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {city.popularVenues.map((venue, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{venue}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create a venue-specific hashtag like <span className="font-medium">#{venue.replace(/\s+/g, '')}Wedding</span> or <span className="font-medium">#{venue.replace(/\s+/g, '')}Love</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Component to display local hashtag ideas
const LocalHashtagIdeas: React.FC<{ state: State; city: City }> = ({ state, city }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">
        {city.name} Wedding Hashtag Ideas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">City-Based Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-medium">#{city.name.replace(/\s+/g, '')}Wedding</span> - Simple and direct</li>
              <li><span className="font-medium">#WeddingIn{city.name.replace(/\s+/g, '')}</span> - Location focused</li>
              <li><span className="font-medium">#Getting{city.localNicknames[0].replace(/\s+/g, '')}Married</span> - Using local nickname</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Landmark-Based Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {city.localLandmarks.map((landmark, index) => (
                <li key={index}>
                  <span className="font-medium">#{landmark.replace(/\s+/g, '')}Love</span> - Featuring {landmark}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nickname-Based Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {city.localNicknames.map((nickname, index) => (
                <li key={index}>
                  <span className="font-medium">#{nickname.replace(/\s+/g, '')}Wedding</span> - Using {nickname}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">State-Based Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-medium">#{state.name.replace(/\s+/g, '')}Wedding</span> - State focus</li>
              <li><span className="font-medium">#{state.abbreviation}Wedding</span> - Using state abbreviation</li>
              <li><span className="font-medium">#Wedding{state.name.replace(/\s+/g, '')}</span> - Another variation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Component to display wedding trends
const WeddingTrends: React.FC<{ state: State }> = ({ state }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">
        Wedding Trends in {state.name}
      </h3>
      <div className="bg-pink-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-pink-800 mb-3">
          Popular Wedding Themes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.weddingStats.popularThemes.map((theme, index) => (
            <div key={index} className="flex items-center">
              <Heart className="h-5 w-5 text-pink-600 mr-2" />
              <div>
                <p className="font-medium">{theme}</p>
                <p className="text-sm text-pink-700">
                  Try <span className="font-medium">#{theme.replace(/\s+/g, '')}Wedding</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationContent;
