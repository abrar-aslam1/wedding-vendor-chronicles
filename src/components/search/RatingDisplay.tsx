import { Star } from "lucide-react";
import { Rating } from "@/types/search";

interface RatingDisplayProps {
  rating?: Rating;
  className?: string;
}

export const RatingDisplay = ({ rating, className = "" }: RatingDisplayProps) => {
  if (!rating?.value) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No ratings available
      </div>
    );
  }

  // Handle nested value structure with null checks
  const ratingValue = rating.value && typeof rating.value === 'object' ? 
    rating.value.value ?? 0 : 
    typeof rating.value === 'string' ? 
      parseFloat(rating.value) : 
      rating.value ?? 0;

  // Handle nested votes_count with null checks
  const votesCount = rating.value && typeof rating.value === 'object' ? 
    rating.value.votes_count ?? 0 : 
    rating.votes_count ?? 0;

  if (isNaN(ratingValue)) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Invalid rating
      </div>
    );
  }

  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(ratingValue * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="h-4 w-4 text-yellow-400" />
            <Star className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="flex">{renderStars()}</div>
        <span className="ml-1 font-medium text-wedding-primary">
          {ratingValue.toFixed(1)}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        {votesCount > 0
          ? <span>{votesCount.toLocaleString()} reviews</span>
          : 'No reviews yet'}
      </div>
    </div>
  );
};