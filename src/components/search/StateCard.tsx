import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Star } from "lucide-react";

interface StateCardProps {
  state: string;
  vendorCount?: number;
  popularCities?: string[];
  averageRating?: number;
  isPopular?: boolean;
  weddingSeasonPeak?: string;
  popularVenueTypes?: string[];
}

export const StateCard = ({ 
  state, 
  vendorCount = 0, 
  popularCities = [], 
  averageRating = 4.5,
  isPopular = false,
  weddingSeasonPeak,
  popularVenueTypes = []
}: StateCardProps) => {
  const navigate = useNavigate();

  // Get state abbreviation for display
  const getStateAbbreviation = (stateName: string) => {
    const stateAbbreviations: Record<string, string> = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateAbbreviations[stateName] || '';
  };

  const stateAbbr = getStateAbbreviation(state);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-l-4 border-l-wedding-primary group"
      onClick={() => navigate(`/states/${state.replace(/\s+/g, '-').toLowerCase()}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-wedding-text group-hover:text-wedding-primary transition-colors">
              {state}
            </h3>
            {stateAbbr && (
              <p className="text-sm text-gray-500 font-medium">{stateAbbr}</p>
            )}
          </div>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">{averageRating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="h-4 w-4" />
          <p className="text-sm font-medium">
            {vendorCount.toLocaleString()} vendors available
          </p>
        </div>
        
        {popularCities && popularCities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">Popular cities:</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {popularCities.slice(0, 4).map((city) => (
                <span 
                  key={city}
                  className="text-xs bg-wedding-secondary/20 text-wedding-text px-2 py-1 rounded-full hover:bg-wedding-secondary/30 transition-colors"
                >
                  {city}
                </span>
              ))}
              {popularCities.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{popularCities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-wedding-primary font-medium group-hover:text-wedding-primary/80">
            Click to browse vendors →
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
