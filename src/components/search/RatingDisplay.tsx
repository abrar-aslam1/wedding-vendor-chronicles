import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface Rating {
  value: number | null;
  count?: number;
  votes_count?: number;
}

interface RatingDisplayProps {
  rating: Rating;
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating, showCount = true, className = '' }) => {
  // Handle case where rating is undefined or null
  if (!rating) {
    return null;
  }
  
  // Handle case where rating.value is undefined, null, or not a number
  const ratingVal = typeof rating.value === 'number' ? rating.value : 0;
  
  // Return null if rating is invalid
  if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
    return null;
  }

  const ratingValue = Math.min(Math.max(ratingVal, 0), 5); // Clamp between 0 and 5
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(ratingValue);
  
  // Use count or votes_count, whichever is available
  const reviewCount = rating.count !== undefined ? rating.count : rating.votes_count;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {fullStars > 0 && [...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
        {emptyStars > 0 && [...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-gray-600">({reviewCount})</span>
      )}
    </div>
  );
};
