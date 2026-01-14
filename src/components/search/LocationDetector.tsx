'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { findNearestCity, formatLocation, NearestCity } from '@/utils/locationMatcher';
import { Button } from '@/components/ui/button';
import { QuickCategoryGrid } from './QuickCategoryGrid';
import { Loader2, MapPin, X, AlertCircle } from 'lucide-react';

interface LocationDetectorProps {
  onManualSelect?: () => void;
}

export const LocationDetector = ({ onManualSelect }: LocationDetectorProps) => {
  const { coordinates, loading, error, supported, requestLocation, clearLocation } = useGeolocation();
  const [nearestCity, setNearestCity] = useState<NearestCity | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  // Find nearest city when coordinates are available
  useEffect(() => {
    if (coordinates) {
      console.log('User coordinates:', coordinates);
      const nearest = findNearestCity(coordinates.latitude, coordinates.longitude);
      
      if (nearest) {
        console.log('Nearest city found:', nearest);
        setNearestCity(nearest);
        setShowCategories(true);
      } else {
        console.error('No nearby city found in our service area');
      }
    }
  }, [coordinates]);

  const handleUseMyLocation = () => {
    setLocationRequested(true);
    requestLocation();
  };

  const handleChangeLocation = () => {
    clearLocation();
    setNearestCity(null);
    setShowCategories(false);
    setLocationRequested(false);
  };

  const handleManualSelect = () => {
    if (onManualSelect) {
      onManualSelect();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="liquid-glass rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-wedding-primary animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-wedding-text mb-2">
              Detecting Your Location...
            </h3>
            <p className="text-sm text-wedding-text/70">
              Please allow location access in your browser
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && locationRequested) {
    return (
      <div className="liquid-glass rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-wedding-text mb-2">
              Location Access Denied
            </h3>
            <p className="text-sm text-wedding-text/70 mb-4">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleUseMyLocation}
                variant="outline"
                className="px-6"
              >
                Try Again
              </Button>
              <Button
                onClick={handleManualSelect}
                className="bg-wedding-primary hover:bg-wedding-primary/90 px-6"
              >
                Choose Location Manually
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show categories after location detected
  if (showCategories && nearestCity) {
    // Determine if we should show distance-based messaging
    const isNearby = nearestCity.distance <= 20; // Within 20km
    const isFarAway = nearestCity.distance > 50; // More than 50km
    
    return (
      <div className="liquid-glass rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 animate-fade-in">
        {/* Location Badge with improved messaging */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-wedding-primary/10 rounded-full px-4 py-2">
            <MapPin className="h-4 w-4 text-wedding-primary" />
            <span className="text-sm font-medium text-wedding-text">
              {isNearby ? 'Near' : 'Closest city:'} {formatLocation(nearestCity)}
            </span>
            {nearestCity.distance <= 100 && (
              <span className="text-xs text-wedding-text/60">
                ({nearestCity.distance} km away)
              </span>
            )}
          </div>
          
          {/* Distance-based helpful message */}
          {isFarAway && (
            <p className="text-xs text-center text-wedding-text/60 max-w-md">
              We've matched you to the nearest major city where we have vendors. 
              You can search manually for a closer location.
            </p>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChangeLocation}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Change Location
          </Button>
        </div>

        {/* Category Grid */}
        <QuickCategoryGrid
          city={nearestCity.city}
          state={nearestCity.state}
        />

        {/* Enhanced Manual Option */}
        <div className="text-center pt-4 border-t border-gray-200 space-y-3">
          <div>
            <p className="text-sm font-medium text-wedding-text/80 mb-1">
              Not in {nearestCity.city}?
            </p>
            <p className="text-xs text-wedding-text/60 mb-3">
              Choose your exact city for more precise results
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleManualSelect}
            className="text-sm"
          >
            Choose My Exact Location
          </Button>
        </div>
      </div>
    );
  }

  // Show browser not supported message
  if (!supported) {
    return (
      <div className="liquid-glass rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-yellow-100 p-3">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-wedding-text mb-2">
              Location Not Available
            </h3>
            <p className="text-sm text-wedding-text/70 mb-4">
              Your browser doesn't support geolocation. Please select your location manually.
            </p>
            <Button
              onClick={handleManualSelect}
              className="bg-wedding-primary hover:bg-wedding-primary/90 px-6"
            >
              Choose Location Manually
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - show both options
  return (
    <div className="liquid-glass rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-wedding-text">
          Find Wedding Vendors Near You
        </h2>
        <p className="text-wedding-text/70">
          Discover top-rated wedding vendors in your area
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {/* Use My Location Button */}
        <Button
          onClick={handleUseMyLocation}
          className="w-full bg-wedding-primary hover:bg-wedding-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Use My Location
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-wedding-text/60 font-medium">
              OR
            </span>
          </div>
        </div>

        {/* Manual Location Button */}
        <Button
          onClick={handleManualSelect}
          variant="outline"
          className="w-full py-6 text-lg font-semibold border-2 hover:bg-wedding-primary/5 hover:border-wedding-primary transition-all duration-200"
        >
          Choose Location Manually
        </Button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-wedding-text/50 max-w-md mx-auto">
        <MapPin className="h-3 w-3 inline mr-1" />
        Your location is only used to find nearby vendors and is never stored on our servers.
      </p>
    </div>
  );
};
