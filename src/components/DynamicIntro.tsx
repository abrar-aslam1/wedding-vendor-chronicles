import { FC, useEffect, useState } from 'react';
import { generateCityIntro, ContentGenerationOptions } from '@/utils/content-generator';

interface DynamicIntroProps {
  city: string;
  state: string;
  category: string;
  subcategory?: string;
  options?: ContentGenerationOptions;
  className?: string;
}

export const DynamicIntro: FC<DynamicIntroProps> = ({
  city,
  state,
  category,
  subcategory,
  options = {
    includeStats: true,
    includeNeighborhoods: true,
    includePricing: true,
    includeSeasonality: true,
    wordCount: 'medium'
  },
  className = ''
}) => {
  const [introContent, setIntroContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const content = await generateCityIntro(
          city,
          state,
          category,
          subcategory,
          options
        );
        
        setIntroContent(content);
      } catch (err) {
        console.error('Error generating intro content:', err);
        setError('Failed to generate content');
        
        // Fallback content
        setIntroContent(
          `Discover the best wedding ${category.toLowerCase()} in ${city}, ${state}. Browse our curated selection of top-rated vendors and find the perfect match for your special day.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (city && state && category) {
      generateContent();
    }
  }, [city, state, category, subcategory, options]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    );
  }

  if (error && !introContent) {
    return (
      <div className={`text-gray-600 ${className}`}>
        <p>Discover the best wedding {category.toLowerCase()} in {city}, {state}.</p>
      </div>
    );
  }

  return (
    <div className={`text-gray-700 leading-relaxed ${className}`}>
      <p>{introContent}</p>
    </div>
  );
};

export default DynamicIntro;
