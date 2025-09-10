import { Button } from "@/components/ui/button";
import { Calendar, Globe, Phone, Heart } from "lucide-react";
import { SearchResult } from "@/types/search";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { trackVendorClick } from "@/utils/vendorUtils";
import { useState, useEffect } from "react";

interface StickyVendorCTAProps {
  vendor: SearchResult;
  onCheckAvailability: () => void;
  onVisitWebsite: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  showThreshold?: number; // Scroll position to show the sticky CTA
}

export const StickyVendorCTA = ({
  vendor,
  onCheckAvailability,
  onVisitWebsite,
  onToggleFavorite,
  isFavorite = false,
  showThreshold = 400
}: StickyVendorCTAProps) => {
  const { scrollPosition } = useScrollPosition();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(scrollPosition > showThreshold);
  }, [scrollPosition, showThreshold]);

  const handleCheckAvailability = async () => {
    await trackVendorClick(vendor, 'check_availability');
    onCheckAvailability();
  };

  const handleVisitWebsite = async () => {
    await trackVendorClick(vendor, 'visit_site');
    onVisitWebsite();
  };

  const handleToggleFavorite = async () => {
    if (onToggleFavorite) {
      await trackVendorClick(vendor, 'save');
      onToggleFavorite();
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Vendor Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {vendor.main_image && (
              <img
                src={vendor.main_image}
                alt={vendor.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {vendor.title}
              </h3>
              {vendor.address && (
                <p className="text-xs text-gray-500 truncate">
                  {vendor.address}
                </p>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Favorite Button (if provided) */}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="p-2"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </Button>
            )}

            {/* Secondary CTA - Visit Website */}
            {vendor.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVisitWebsite}
                className="hidden sm:flex items-center space-x-1 px-3"
              >
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Button>
            )}

            {/* Primary CTA - Check Availability */}
            <Button
              onClick={handleCheckAvailability}
              className="bg-wedding-primary hover:bg-wedding-primary/90 text-white px-4 py-2 flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Check Availability</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </div>
        </div>

        {/* Mobile-only secondary actions */}
        <div className="sm:hidden mt-2 flex space-x-2">
          {vendor.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisitWebsite}
              className="flex-1 flex items-center justify-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </Button>
          )}
          {vendor.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trackVendorClick(vendor, 'call');
                window.location.href = `tel:${vendor.phone}`;
              }}
              className="flex-1 flex items-center justify-center space-x-1"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
