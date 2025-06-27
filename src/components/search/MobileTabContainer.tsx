import { useState, useEffect } from "react";
import { MapPin, Instagram } from "lucide-react";
import { SearchResult } from "@/types/search";
import { VendorCard } from "./VendorCard";
import { InstagramVendorCard } from "./InstagramVendorCard";
import { ComingSoonBanner } from "./ComingSoonBanner";

interface MobileTabContainerProps {
  googleResults: SearchResult[];
  instagramResults: SearchResult[];
  favorites: Set<string>;
  loading: Set<string>;
  onToggleFavorite: (vendor: SearchResult) => void;
  subcategory?: string;
  vendorType: string;
}

type TabType = 'google' | 'instagram';

export const MobileTabContainer = ({
  googleResults,
  instagramResults,
  favorites,
  loading,
  onToggleFavorite,
  subcategory,
  vendorType
}: MobileTabContainerProps) => {
  // Smart default: choose tab with more results, fallback to Google
  const getDefaultTab = (): TabType => {
    if (instagramResults.length > googleResults.length) {
      return 'instagram';
    }
    return 'google';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());

  // Update active tab when results change
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [googleResults.length, instagramResults.length]);

  // Remember user's tab preference in localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('preferred-vendor-tab') as TabType;
    if (savedTab && (savedTab === 'google' || savedTab === 'instagram')) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('preferred-vendor-tab', tab);
  };

  const renderTabContent = () => {
    if (activeTab === 'google') {
      return googleResults.length > 0 ? (
        <div className="space-y-6">
          {googleResults.map((vendor, index) => (
            <VendorCard
              key={`google-${index}`}
              vendor={vendor}
              isFavorite={favorites.has(vendor.place_id || '')}
              isLoading={loading.has(vendor.place_id || '')}
              onToggleFavorite={onToggleFavorite}
              subcategory={subcategory}
            />
          ))}
        </div>
      ) : (
        <ComingSoonBanner type="google" vendorType={vendorType} />
      );
    } else {
      return instagramResults.length > 0 ? (
        <div className="space-y-6">
          {instagramResults.map((vendor, index) => (
            <InstagramVendorCard
              key={`instagram-${index}`}
              vendor={vendor}
              isFavorite={favorites.has(vendor.place_id || '')}
              isLoading={loading.has(vendor.place_id || '')}
              onToggleFavorite={onToggleFavorite}
              subcategory={subcategory}
            />
          ))}
        </div>
      ) : (
        <ComingSoonBanner type="instagram" vendorType={vendorType} />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleTabChange('google')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'google'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Google</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'google'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {googleResults.length}
          </span>
        </button>
        
        <button
          onClick={() => handleTabChange('instagram')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'instagram'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Instagram className="h-4 w-4" />
          <span>Instagram</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'instagram'
              ? 'bg-pink-100 text-pink-600'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {instagramResults.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
