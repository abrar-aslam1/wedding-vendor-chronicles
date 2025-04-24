import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface StateCardProps {
  state: string;
  vendorCount?: number;
  popularCities?: string[];
}

export const StateCard = ({ state, vendorCount = 0, popularCities = [] }: StateCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => navigate(`/search/${state.toLowerCase()}`)}
    >
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold text-wedding-text">{state}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {vendorCount} vendors available
        </p>
        {popularCities && popularCities.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Popular cities:</p>
            <div className="flex flex-wrap gap-1">
              {popularCities.slice(0, 5).map((city) => (
                <span 
                  key={city}
                  className="text-xs bg-wedding-secondary/20 text-wedding-text px-2 py-1 rounded-full"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
