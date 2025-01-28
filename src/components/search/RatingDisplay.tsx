import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface Rating {
  value: number | null;
  count?: number;
}

interface RatingDisplayProps {
  rating: Rating;
  showCount?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating, showCount = true }) => {
  if (!rating || rating.value === null) {
    return null;
  }

  const ratingValue = rating.value || 0;
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - Math.ceil(ratingValue))].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
      {showCount && rating.count !== undefined && (
        <span className="text-sm text-gray-600">({rating.count})</span>
      )}
    </div>
  );
};