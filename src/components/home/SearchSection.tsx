
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SearchForm } from "@/components/search/SearchForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Dynamically import LocationDetector to prevent SSR issues with navigator
const LocationDetector = dynamic(
  () => import("@/components/search/LocationDetector").then(mod => ({ default: mod.LocationDetector })),
  { ssr: false }
);

export const SearchSection = () => {
  const router = useRouter();
  const [showManualSearch, setShowManualSearch] = useState(false);

  const handleManualSelect = () => {
    setShowManualSearch(true);
  };

  const handleBackToQuickSearch = () => {
    setShowManualSearch(false);
  };

  const handleSearch = async (category: string, state: string, city: string, subcategory?: string) => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    
    const url = subcategory 
      ? `/search/${categorySlug}/${stateSlug}/${citySlug}?subcategory=${subcategory}`
      : `/search/${categorySlug}/${stateSlug}/${citySlug}`;
    
    router.push(url);
  };
  
  return (
    <div className="relative z-10">
      {/* LocationDetector already has liquid-glass styling, no need for extra wrapper */}
      <div>
            {showManualSearch ? (
              /* Manual Search Form */
              <div className="space-y-6 animate-slide-up">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToQuickSearch}
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quick Search
                  </Button>
                </div>
                <SearchForm 
                  onSearch={handleSearch}
                  isSearching={false}
                />
              </div>
            ) : (
              /* Location Detection */
              <LocationDetector onManualSelect={handleManualSelect} />
            )}
      </div>
      
      {/* Browse by State Link (for users who want full list) */}
      {!showManualSearch && (
        <div className="text-center mt-6 pt-6 border-t border-white/20">
          <p className="text-sm text-wedding-text/70 mb-3">
            Prefer to browse all locations?
          </p>
          <Button
            variant="link"
            onClick={() => router.push("/states")}
            className="text-wedding-primary hover:text-wedding-primary/80"
          >
            View All States →
          </Button>
        </div>
      )}
    </div>
  );
}
