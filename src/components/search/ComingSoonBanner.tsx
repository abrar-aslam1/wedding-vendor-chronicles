import { Heart, Instagram, MapPin, Sparkles } from "lucide-react";

interface ComingSoonBannerProps {
  type: 'google' | 'instagram';
  vendorType?: string;
}

export const ComingSoonBanner = ({ type, vendorType = 'vendors' }: ComingSoonBannerProps) => {
  const isInstagram = type === 'instagram';
  
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-wedding-primary/5 via-white to-wedding-secondary/5 p-8 text-center shadow-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4">
          <Heart className="h-8 w-8 text-wedding-primary" />
        </div>
        <div className="absolute top-4 right-4">
          <Sparkles className="h-6 w-6 text-wedding-secondary" />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          {isInstagram ? (
            <Instagram className="h-12 w-12 text-pink-500" />
          ) : (
            <MapPin className="h-12 w-12 text-blue-500" />
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4">
          {isInstagram ? (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Instagram className="h-8 w-8 text-white" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-wedding-text mb-2">
          {isInstagram ? 'Instagram Vendors' : 'Google Results'}
        </h3>
        
        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
          {isInstagram ? (
            <>We're expanding our Instagram {vendorType.toLowerCase()} network! Check back soon for more social media verified vendors in your area.</>
          ) : (
            <>We're working to bring you more {vendorType.toLowerCase()} from Google Maps. New listings are added regularly!</>
          )}
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-wedding-primary/10 text-wedding-primary rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Coming Soon
        </div>
        
        {/* Subtle animation */}
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-wedding-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-wedding-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-wedding-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
