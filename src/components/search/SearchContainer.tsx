import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { StateWideResults } from "./StateWideResults";
import { LoadMoreButton } from "./LoadMoreButton";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { SearchHeader } from "./SearchHeader";
import { LoadingState } from "./LoadingState";
import { SearchErrorBoundary } from "@/components/ErrorBoundaries";

export const SearchContainer = () => {
  const { category, subcategory, city, state } = useParams<{ 
    category: string; 
    subcategory?: string;
    city?: string; 
    state?: string; 
  }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    console.log('SearchContainer mounted with params:', { category, subcategory, city, state });
    
    // Cleanup previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Check if this is a test URL for showing the "no results" message
    const urlParams = new URLSearchParams(window.location.search);
    const testNoResults = urlParams.get('test-no-results') === 'true';
    
    if (testNoResults) {
      console.log('Test mode: Showing no results message');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    if (city && state) {
      const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
      
      // Check if this is a state-wide search (city = "all-cities")
      if (city === 'all-cities') {
        console.log('Initiating state-wide search for:', { cleanCategory, subcategory, state });
        fetchStateResults(cleanCategory, state, subcategory);
      } else {
        console.log('Initiating city-specific search for:', { cleanCategory, subcategory, city, state });
        fetchResults(cleanCategory, city, state, subcategory);
      }
    } else if (state && !city) {
      // Handle state-only searches (from states page)
      const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
      console.log('Initiating state-only search for:', { cleanCategory, subcategory, state });
      fetchStateResults(cleanCategory, state, subcategory);
    } else {
      // If we don't have city and state, we're not in a search context
      // Set empty results to ensure we don't show a loading state indefinitely
      setSearchResults([]);
      setIsSearching(false);
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [category, subcategory, city, state]);

  const handleSearch = async (selectedCategory: string, selectedState: string, selectedCity: string, selectedSubcategory?: string) => {
    console.log('Handling search with:', { 
      selectedCategory, 
      selectedState, 
      selectedCity,
      selectedSubcategory 
    });
    
    const categoryToUse = category 
      ? category.replace('top-20/', '').replace(/-/g, ' ') 
      : selectedCategory;
    
    if (!categoryToUse) {
      console.error('No category provided for search');
      return;
    }
    
    const formattedCategory = categoryToUse.toLowerCase().replace(/ /g, '-');
    
    // Format subcategory for URL (convert to kebab-case)
    const formattedSubcategory = selectedSubcategory 
      ? selectedSubcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      : undefined;
    
    const urlPath = formattedSubcategory 
      ? `/top-20/${formattedCategory}/${formattedSubcategory}/${selectedCity}/${selectedState}`
      : `/top-20/${formattedCategory}/${selectedCity}/${selectedState}`;
    
    console.log('Navigating to URL:', urlPath);
    navigate(urlPath);
  };

  const fetchStateResults = async (searchCategory: string, searchState: string, subcategory?: string) => {
    console.log('Starting fetchStateResults with:', { searchCategory, searchState, subcategory });
    setIsSearching(true);
    
    try {
      // For state-only searches, we'll query the vendors table directly
      // since we want to show all vendors in the state regardless of city
      console.log('Fetching vendors directly from database for state:', searchState);
      
      let query = supabase
        .from('vendors')
        .select('*')
        .ilike('state', `%${searchState}%`);
      
      // Apply category filter if specified
      if (searchCategory && searchCategory !== 'wedding vendors') {
        query = query.ilike('category', `%${searchCategory}%`);
      }
      
      const { data: vendors, error } = await query.limit(50);
      
      if (error) {
        console.error('Error fetching vendors from database:', error);
        throw error;
      }
      
      if (!vendors || vendors.length === 0) {
        console.log('❌ No vendors found in database for state:', searchState);
        setSearchResults([]);
        return;
      }
      
      // Transform database vendors to SearchResult format
      const vendorResults: SearchResult[] = vendors.map((vendor: any) => ({
        title: vendor.business_name || 'Unknown Business',
        description: vendor.description || '',
        rating: undefined,
        phone: vendor.contact_info?.phone,
        address: `${vendor.city || ''}, ${vendor.state || ''}`,
        url: vendor.contact_info?.website,
        place_id: `vendor_${vendor.id}`,
        main_image: vendor.images?.[0],
        images: vendor.images || [],
        snippet: vendor.description || '',
        latitude: undefined,
        longitude: undefined,
        business_hours: undefined,
        price_range: undefined,
        payment_methods: undefined,
        service_area: [vendor.city, vendor.state].filter(Boolean),
        categories: [vendor.category || 'wedding vendor'],
        reviews: undefined,
        year_established: undefined,
        email: vendor.contact_info?.email,
        city: vendor.city,
        state: vendor.state,
        postal_code: undefined,
        vendor_source: 'database' as const
      }));
      
      console.log(`✅ Found ${vendorResults.length} vendors in database for ${searchState}`);
      setSearchResults(vendorResults);
      
    } catch (error) {
      console.error('Error in fetchStateResults:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string, subcategory?: string) => {
    console.log('Starting fetchResults with:', { searchCategory, searchCity, searchState, subcategory });
    setIsSearching(true);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Convert URL-formatted subcategory to proper format
      const formattedSubcategory = subcategory 
        ? subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : undefined;
      
      console.log('Original subcategory from URL:', subcategory);
      console.log('Formatted subcategory for search:', formattedSubcategory);

      // State abbreviations for API consistency
      const stateAbbreviations: { [key: string]: string } = {
        'texas': 'TX', 'california': 'CA', 'florida': 'FL', 'new york': 'NY',
        'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH', 'georgia': 'GA',
        'north carolina': 'NC', 'michigan': 'MI'
      };
      
      const stateAbbr = stateAbbreviations[searchState.toLowerCase()] || searchState.toUpperCase();
      const formattedLocation = `${searchCity.charAt(0).toUpperCase() + searchCity.slice(1)}, ${stateAbbr}`;
      
      console.log('🚀 Starting parallel vendor search...');
      console.log('📦 Search parameters:', { 
        keyword: searchCategory, 
        location: formattedLocation, 
        subcategory: formattedSubcategory 
      });

      // Execute Google and Instagram searches in parallel for maximum performance
      const searchStartTime = Date.now();
      
      // Helper function to add timeout to promises with proper typing
      const withTimeout = (promise: Promise<any>, ms: number): Promise<any> => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
          )
        ]);
      };

      const [googleResults, instagramResults] = await Promise.allSettled([
        // Google vendors search with timeout
        withTimeout((async () => {
          try {
            console.log('🔍 Calling search-google-vendors API...');
            const { data: response, error } = await supabase.functions.invoke('search-google-vendors', {
              body: { 
                keyword: searchCategory,
                location: formattedLocation,
                subcategory: formattedSubcategory
              }
            });
            
            if (error) {
              console.error('❌ Google vendors API error:', error);
              return [];
            }
            
            const results = response?.results || [];
            console.log(`✅ Google vendors API: ${results.length} results`);
            return results;
          } catch (error) {
            console.error('❌ Google vendors API failed:', error);
            return [];
          }
        })(), 30000), // 30 second timeout
        
        // Instagram vendors search with timeout
        withTimeout((async () => {
          try {
            console.log('📸 Calling search-instagram-vendors API...');
            const { data: response, error } = await supabase.functions.invoke('search-instagram-vendors', {
              body: { 
                keyword: searchCategory,
                location: formattedLocation,
                subcategory: formattedSubcategory
              }
            });
            
            if (error) {
              console.error('❌ Instagram vendors API error:', error);
              return [];
            }
            
            const results = response?.results || [];
            console.log(`✅ Instagram vendors API: ${results.length} results`);
            return results;
          } catch (error) {
            console.error('❌ Instagram vendors API failed:', error);
            return [];
          }
        })(), 30000)
      ]);

      const searchTime = Date.now() - searchStartTime;
      console.log(`⏱️ Search completed in ${searchTime}ms`);

      // Extract results from Promise.allSettled responses
      const googleVendors = googleResults.status === 'fulfilled' ? googleResults.value : [];
      const instagramVendors = instagramResults.status === 'fulfilled' ? instagramResults.value : [];

      console.log(`📊 Results: Google=${googleVendors.length}, Instagram=${instagramVendors.length}`);

      // Log any failed searches
      if (googleResults.status === 'rejected') {
        console.error('❌ Google search failed:', googleResults.reason);
      }
      if (instagramResults.status === 'rejected') {
        console.error('❌ Instagram search failed:', instagramResults.reason);
      }

      // Combine all results
      const combinedResults = [...googleVendors, ...instagramVendors];
      
      // Set the actual results - no fake data
      setSearchResults(combinedResults);
      console.log(`🔗 Combined results: ${combinedResults.length} total`);

      if (combinedResults.length === 0) {
        console.log('❌ No vendors found for search criteria');
        toast({
          title: "No Results Found",
          description: "No vendors found for your search criteria. Try adjusting your search terms or location.",
          variant: "default",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Search request was cancelled');
        return;
      }
      console.error('Error in fetchResults:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isSearching) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setIsSearching(true);
    
    try {
      const formattedSubcategory = subcategory 
        ? subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : undefined;
      
      const cleanCategory = category ? category.replace('top-20/', '').replace(/-/g, ' ') : 'wedding vendors';
      const stateAbbreviations: { [key: string]: string } = {
        'texas': 'TX', 'california': 'CA', 'florida': 'FL', 'new york': 'NY',
        'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH', 'georgia': 'GA',
        'north carolina': 'NC', 'michigan': 'MI'
      };
      
      const stateAbbr = stateAbbreviations[state?.toLowerCase() || ''] || state?.toUpperCase() || '';
      const formattedLocation = `${city?.charAt(0).toUpperCase() + city?.slice(1)}, ${stateAbbr}`;
      
      const { data: response, error } = await supabase.functions.invoke('search-vendors', {
        body: { 
          keyword: cleanCategory,
          location: formattedLocation,
          subcategory: formattedSubcategory,
          page: nextPage,
          limit: 30
        }
      });
      
      if (error) throw error;
      
      const newResults = response?.results || [];
      setSearchResults(prev => [...prev, ...newResults]);
      setHasMore(response?.hasMore || false);
      
    } catch (error) {
      console.error('Error loading more results:', error);
      toast({
        title: "Error",
        description: "Failed to load more results. Please try again.",
        variant: "destructive",
      });
      setCurrentPage(currentPage); // Reset page on error
    } finally {
      setIsSearching(false);
    }
  };

  // Check if this is a state-wide search
  const isStateWideSearch = city === 'all-cities';
  
  return (
    <SearchErrorBoundary onRetry={() => window.location.reload()}>
      <div className="container mx-auto px-4 py-8 mt-16">
        {!isStateWideSearch && <SearchHeader subcategory={subcategory} />}
        
        {(!city || !state || city === 'all-cities') && !isStateWideSearch && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <SearchForm 
              onSearch={handleSearch} 
              isSearching={isSearching} 
              preselectedCategory={category ? category.replace('top-20/', '').replace(/-/g, ' ') : undefined} 
            />
          </div>
        )}
        
        <div className="transition-all duration-500 ease-in-out">
          {isSearching ? (
            <div className="animate-fade-in">
              <LoadingState />
            </div>
          ) : isStateWideSearch && state && category ? (
            <div className="animate-slide-up">
              <StateWideResults 
                results={searchResults}
                isSearching={isSearching}
                state={state}
                category={category.replace('top-20/', '')}
                subcategory={subcategory}
              />
            </div>
          ) : (
            <div className="animate-slide-up">
              <SearchResults results={searchResults} isSearching={isSearching} subcategory={subcategory} />
              {!isStateWideSearch && searchResults.length > 0 && (
                <LoadMoreButton
                  onLoadMore={handleLoadMore}
                  isLoading={isSearching}
                  hasMore={hasMore}
                  totalResults={totalResults}
                  currentResults={searchResults.length}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </SearchErrorBoundary>
  );
};
