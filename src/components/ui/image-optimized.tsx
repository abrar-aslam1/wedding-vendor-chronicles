import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallback,
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate WebP and fallback sources
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'original' = 'original') => {
    if (!originalSrc) return originalSrc;
    
    // If it's already a data URL or external URL, return as-is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // For local images, we could implement WebP conversion here
    // For now, return the original source
    return originalSrc;
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      
      <picture>
        {/* WebP source for modern browsers */}
        <source srcSet={getOptimizedSrc(imageSrc, 'webp')} type="image/webp" />
        
        {/* Fallback image */}
        <img
          src={getOptimizedSrc(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            "w-full h-full object-cover"
          )}
        />
      </picture>
    </div>
  );
};
