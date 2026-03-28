import React from 'react';
import { StarIcon } from 'lucide-react';
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}
export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };
  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) =>
      <StarIcon
        key={index}
        className={`${sizeClasses[size]} ${index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors' : ''}`}
        onClick={() => handleClick(index)} />

      )}
    </div>);

}