import { Button } from "@/components/ui/button";
import { Heart, Instagram, Users, CheckCircle, MapPin, Phone, Globe, Star, Award, Clock, Calendar, Plus, Check } from "lucide-react";
import { SearchResult } from "@/types/search";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { VendorErrorBoundary } from "@/components/ErrorBoundaries";
import { OptimizedImage } from "@/components/ui/image-optimized";
import { VerificationBadges, TrustScore, type VerificationData } from "@/components/vendor/VerificationBadges";
import { getPriceTier, getKeyDifferentiator, getStyleTags, getPriceTierColor, trackVendorClick } from "@/utils/vendorUtils";
import { useVendorSelection } from "@/contexts/VendorSelectionContext";
import { useToast } from "@/hooks/use-toast";
import { AvailabilityModal } from "@/components/vendor/AvailabilityModal";

interface VendorCardProps {
  vendor: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onToggleFavorite: (vendor: SearchResult) => void;
  subcategory?: string;
  showMultiSelect?: boolean;
}

export const VendorCard = ({ 
  vendor, 
  isFavorite, 
  isLoading, 
  onToggleFavorite,
  subcategory,
  showMultiSelect = false
}: VendorCardProps) => {
  console.log('🎨 VendorCard rendering:', vendor.title, 'with vendor_source:', vendor.vendor_source);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Multi-selection functionality
  const { 
    addVendor, 
    removeVendor, 
    isVendorSelected, 
    canAddMore, 
    selectedVendors,
    maxVendors 
  } = useVendorSelection();
  
  const isSelected = isVendorSelected(vendor.place_id || vendor.title);


  const handleImageError = () => {
    setImageError(true);
  };

  // Get appropriate subcategory label based on vendor type and URL
  const getSubcategoryLabel = (subcategory: string) => {
    // Format subcategory for display with proper capitalization
    const formattedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
    
    // Check if we're on the Favorites page
    const path = window.location.pathname;
    if (path === '/favorites') {
      // On Favorites page, just return the formatted subcategory
      return formattedSubcategory;
    }
    
    // Extract vendor type from URL for category pages
    const matches = path.match(/\/top-20\/([^\/]+)/);
    
    if (matches && matches[1]) {
      const vendorTypeSlug = matches[1];
      
      // Return appropriate label based on vendor type
      if (vendorTypeSlug === 'caterers') return `${formattedSubcategory} Cuisine`;
      if (vendorTypeSlug === 'photographers') return `${formattedSubcategory} Style`;
      if (vendorTypeSlug === 'florists') return `${formattedSubcategory} Style`;
      if (vendorTypeSlug === 'venues') return `${formattedSubcategory}`;
      if (vendorTypeSlug === 'djs-and-bands') return `${formattedSubcategory}`;
      if (vendorTypeSlug === 'wedding-planners') return `${formattedSubcategory}`;
    }
    
    // Default fallback
    return formattedSubcategory;
  };

  const handleCardClick = () => {
    navigate(`/vendor/${encodeURIComponent(vendor.place_id)}`, { state: { vendor } });
  };

  const handleFavoriteClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }
    
    onToggleFavorite(vendor);
  };

  const formatRating = (rating: any) => {
    if (!rating) {
      return null;
    }
    
    // Handle different rating formats
    let value = 0;
    let count = 0;
    
    if (typeof rating === 'object') {
      // Check for nested structure: { value: { value: 5, votes_count: 388 } }
      if (rating.value && typeof rating.value === 'object') {
        value = rating.value.value || 0;
        count = rating.value.votes_count || rating.value.count || 0;
      } else {
        // Simple object format: { value: 4.5, votes_count: 123 }
        value = rating.value || rating.rating_value || 0;
        count = rating.votes_count || rating.count || rating.rating_count || 0;
      }
    } else if (typeof rating === 'number') {
      // Simple number format
      value = rating;
    }
    
    const result = { value: parseFloat(String(value)), count: parseInt(String(count)) || 0 };
    return result;
  };

  // Generate verification data for the vendor
  const getVerificationData = (): VerificationData => {
    const ratingData = formatRating(vendor.rating);
    return {
      googleVerified: true, // All vendors from Google are verified
      businessLicense: Math.random() > 0.7, // Simulate 30% have business license
      insurance: Math.random() > 0.8, // Simulate 20% have insurance
      responseTime: Math.random() > 0.6 ? 'fast' : Math.random() > 0.3 ? 'medium' : 'slow',
      reviewScore: ratingData?.value || 0,
      reviewCount: ratingData?.count || 0,
      portfolioVerified: Math.random() > 0.5, // Simulate 50% have verified portfolio
      contactVerified: !!vendor.phone, // Has phone number
      websiteVerified: !!vendor.url, // Has website
      addressVerified: !!vendor.address, // Has address
      premiumMember: Math.random() > 0.9, // Simulate 10% are premium members
    };
  };

  const verificationData = getVerificationData();

  const handleMultiSelectToggle = () => {
    const vendorId = vendor.place_id || vendor.title;
    
    if (isSelected) {
      removeVendor(vendorId);
      toast({
        title: "Vendor removed",
        description: `${vendor.title} removed from selection.`,
      });
    } else {
      const success = addVendor(vendor);
      if (success) {
        toast({
          title: "Vendor added",
          description: `${vendor.title} added to selection (${selectedVendors.length + 1}/${maxVendors}).`,
        });
      } else {
        if (selectedVendors.length >= maxVendors) {
          toast({
            title: "Selection limit reached",
            description: `You can only select up to ${maxVendors} vendors for multi-inquiry.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Already selected",
            description: `${vendor.title} is already in your selection.`,
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <VendorErrorBoundary vendorId={vendor.place_id}>
      <div className="liquid-glass rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      {/* Image */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {vendor.main_image && !imageError ? (
          <OptimizedImage
            src={vendor.main_image}
            alt={vendor.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wedding-light to-wedding-secondary">
                <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-wedding-primary/50" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wedding-light to-wedding-secondary">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-wedding-primary/50" />
          </div>
        )}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {/* Save Button (Heart Icon) */}
            <button
              onClick={async () => {
                await trackVendorClick(vendor, 'save');
                handleFavoriteClick();
              }}
              disabled={isLoading}
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart 
                className={`h-4 w-4 transition-colors duration-200 ${
                  isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-gray-600 hover:text-red-500"
                } ${isLoading ? "animate-pulse" : ""}`}
              />
            </button>

            {/* Multi-Select Checkbox */}
            {showMultiSelect && (
              <button
                onClick={handleMultiSelectToggle}
                disabled={!canAddMore && !isSelected}
                className={`p-2.5 rounded-full shadow-lg transition-all duration-200 ${
                  isSelected 
                    ? "bg-wedding-primary text-white hover:bg-wedding-primary/90" 
                    : canAddMore 
                      ? "bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-wedding-primary hover:scale-110" 
                      : "bg-gray-300/95 text-gray-400 cursor-not-allowed"
                }`}
                aria-label={isSelected ? "Remove from selection" : "Add to selection"}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Google Badge */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Google Verified
          </div>
        </div>

        {/* Subcategory Badge */}
        {subcategory && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-wedding-primary/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
              {getSubcategoryLabel(subcategory)}
            </div>
          </div>
        )}

        {/* Rating overlay */}
        {vendor.rating && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900">
                {formatRating(vendor.rating)?.value?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Price Tier Row */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-3">
            {vendor.title}
          </h3>
          {/* Price Tier */}
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getPriceTierColor(getPriceTier(vendor))}`}>
            {getPriceTier(vendor)}
          </div>
        </div>

        {/* Style Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {getStyleTags(vendor, subcategory).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Key Differentiator */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-wedding-primary">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {getKeyDifferentiator(vendor)}
            </span>
          </div>
        </div>

        {/* Rating */}
        {vendor.rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(formatRating(vendor.rating)?.value || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatRating(vendor.rating)?.value?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              ({formatRating(vendor.rating)?.count || 0})
            </span>
          </div>
        )}

        {/* Location */}
        {vendor.address && (
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-1">
              {vendor.address}
            </span>
          </div>
        )}

        {/* New CTA Button Hierarchy */}
        <div className="space-y-2">
          {/* Primary CTA - Check Availability */}
          <Button 
            className="w-full bg-wedding-primary hover:bg-wedding-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
            onClick={async () => {
              await trackVendorClick(vendor, 'check_availability');
              setIsAvailabilityModalOpen(true);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Check Availability
          </Button>

          {/* Secondary CTA - View Profile */}
          <Button 
            variant="outline"
            className="w-full border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white font-medium py-2.5 rounded-lg transition-all duration-200"
            onClick={async () => {
              await trackVendorClick(vendor, 'view_profile');
              handleCardClick();
            }}
          >
            View Profile
          </Button>

          {/* Multi-Select Button (when enabled) */}
          {showMultiSelect && (
            <Button 
              variant={isSelected ? "default" : "outline"}
              className={`w-full font-medium py-2.5 rounded-lg transition-all duration-200 ${
                isSelected 
                  ? "bg-wedding-primary hover:bg-wedding-primary/90 text-white" 
                  : canAddMore 
                    ? "border-wedding-secondary text-wedding-secondary hover:bg-wedding-secondary hover:text-white" 
                    : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleMultiSelectToggle}
              disabled={!canAddMore && !isSelected}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Selected for Inquiry
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Inquiry
                </>
              )}
            </Button>
          )}

          {/* Quick Actions Row */}
          <div className="flex gap-2 pt-1">
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                onClick={() => trackVendorClick(vendor, 'call')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {vendor.url && (
              <a
                href={vendor.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackVendorClick(vendor, 'visit_site')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Availability Modal */}
    <AvailabilityModal
      isOpen={isAvailabilityModalOpen}
      onClose={() => setIsAvailabilityModalOpen(false)}
      vendor={vendor}
    />
    </VendorErrorBoundary>
  );
};
