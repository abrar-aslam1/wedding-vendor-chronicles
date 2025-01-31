import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CityCardProps {
  city: string;
  state: string;
  vendorCount?: number;
  averageRating?: number;
}

export const CityCard = ({ city, state, vendorCount = 0, averageRating }: CityCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => navigate(`/search/${state.toLowerCase()}/${city.toLowerCase()}`)}
    >
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold text-wedding-text">{city}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {vendorCount} vendors available
        </p>
        {averageRating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};