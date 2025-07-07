import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { StateWideResults } from "./StateWideResults";
import { LoadMoreButton } from "./LoadMoreButton";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { SearchHeader } from "./SearchHeader";
import { LoadingState } from "./LoadingState";
import { useDebounce } from "@/hooks/useDebounce";

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

  useEffect(() => {
    console.log('SearchContainer mounted with params:', { category, subcategory, city, state });
    
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
        title: vendor.business_name,
        description: vendor.description,
        rating: undefined,
        phone: vendor.contact_info?.phone,
        address: `${vendor.city}, ${vendor.state}`,
        url: vendor.contact_info?.website,
        place_id: `vendor_${vendor.id}`,
        main_image: vendor.images?.[0],
        images: vendor.images || [],
        snippet: vendor.description,
        latitude: undefined,
        longitude: undefined,
        business_hours: undefined,
        price_range: undefined,
        payment_methods: undefined,
        service_area: [vendor.city, vendor.state],
        categories: [vendor.category],
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
      
      const [googleResults, instagramResults] = await Promise.allSettled([
        // Google vendors search
        (async () => {
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
        })(),
        
        // Instagram vendors search
        (async () => {
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
        })()
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

  const fetchGoogleResults = async (searchCategory: string, searchCity: string, searchState: string, locationCode: number, subcategory?: string): Promise<SearchResult[]> => {
    // Skip cache if subcategory is provided to ensure fresh, filtered results
    if (!subcategory) {
      const { data: cachedResults, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('*')
        .eq('category', searchCategory.toLowerCase())
        .eq('city', searchCity)
        .eq('state', searchState)
        .eq('location_code', locationCode)
        .maybeSingle();

      console.log('Cache query response:', { 
        cachedResults, 
        cacheError,
        cacheHit: !!cachedResults?.search_results,
        cacheTimestamp: cachedResults?.created_at,
        cacheExpiry: cachedResults?.expires_at
      });

      if (cacheError) {
        console.error('Cache fetch error:', cacheError);
        throw cacheError;
      }

      if (cachedResults?.search_results) {
        console.log('Using cached Google results from:', new Date(cachedResults.created_at).toLocaleString());
        return cachedResults.search_results as SearchResult[];
      }
    } else {
      console.log('Bypassing cache for subcategory search:', subcategory);
    }

    console.log('No cache found, fetching from Google API...');
    
    // Convert state name to abbreviation for API consistency
    const stateAbbreviations: { [key: string]: string } = {
      'texas': 'TX',
      'california': 'CA',
      'florida': 'FL',
      'new york': 'NY',
      'illinois': 'IL',
      'pennsylvania': 'PA',
      'ohio': 'OH',
      'georgia': 'GA',
      'north carolina': 'NC',
      'michigan': 'MI'
    };
    
    const stateAbbr = stateAbbreviations[searchState.toLowerCase()] || searchState.toUpperCase();
    const formattedLocation = `${searchCity.charAt(0).toUpperCase() + searchCity.slice(1)}, ${stateAbbr}`;
    
    console.log('Formatted location for API:', formattedLocation);

    // Enhanced logging for debugging
    const requestPayload = { 
      keyword: searchCategory,
      location: formattedLocation
    };
    
    console.log('🚀 Frontend making request to search-vendors edge function');
    console.log('📦 Request payload:', JSON.stringify(requestPayload, null, 2));
    console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'using fallback');
    console.log('🔑 Using anon key:', (import.meta.env.VITE_SUPABASE_ANON_KEY || 'using fallback').substring(0, 20) + '...');
    
    const requestStartTime = Date.now();
    const { data: response, error: searchError } = await supabase.functions.invoke('search-vendors', {
      body: { ...requestPayload, page: currentPage, limit: 30 }
    });
    const requestEndTime = Date.now();

    console.log(`⏱️ Request completed in ${requestEndTime - requestStartTime}ms`);
    console.log('🔍 Edge function response:', response);
    console.log('❌ Edge function error:', searchError);
    
    if (searchError) {
      console.error('🚨 Edge function failed:', searchError);
      throw new Error(`Edge function error: ${searchError.message || JSON.stringify(searchError)}`);
    }
    
    if (!response) {
      console.error('🚨 No response from edge function');
      throw new Error('No response from search-vendors edge function');
    }
    
    const freshResults = response?.results || [];
    console.log('📊 Fresh results count:', freshResults.length);
    console.log('📊 Total results:', response?.totalResults);
    console.log('📊 Has more:', response?.hasMore);
    
    // Debug: Show breakdown by vendor source
    if (freshResults && freshResults.length > 0) {
      const sourceBreakdown = freshResults.reduce((acc, result) => {
        const source = result.vendor_source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('📊 Edge function results by source:', sourceBreakdown);
      
      // Show Instagram vendors specifically
      const instagramVendors = freshResults.filter(r => r.vendor_source === 'instagram');
      console.log(`📸 Instagram vendors from edge function: ${instagramVendors.length}`);
      if (instagramVendors.length > 0) {
        console.log('📸 First Instagram vendor from edge:', instagramVendors[0]);
      }
    }
    
    setTotalResults(response?.totalResults || 0);
    setHasMore(response?.hasMore || false);
    
    console.log('📊 Google API search response:', { 
      resultsCount: freshResults?.length,
      totalResults: response?.totalResults,
      hasMore: response?.hasMore,
      searchError,
      hasData: !!freshResults,
      dataType: typeof freshResults,
      isArray: Array.isArray(freshResults),
      firstResult: freshResults?.[0] ? {
        title: freshResults[0].title,
        vendor_source: freshResults[0].vendor_source,
        rating: freshResults[0].rating,
        hasRating: !!freshResults[0].rating
      } : null
    });
    
    if (searchError) {
      console.error('❌ Search error details:', JSON.stringify(searchError, null, 2));
    }
    
    if (freshResults && Array.isArray(freshResults) && freshResults.length > 0) {
      console.log('✅ First result sample:', {
        title: freshResults[0]?.title,
        vendor_source: freshResults[0]?.vendor_source,
        hasRating: !!freshResults[0]?.rating
      });
    }

    if (searchError) {
      console.error('Google search error:', searchError);
      throw searchError;
    }

    if (freshResults && Array.isArray(freshResults)) {
      console.log('Processing Google results...');
      
      // The edge function returns all results (Instagram, Google, database) - don't filter them here
      // The separation happens in the SearchResults component for display purposes
      const allResults = freshResults;
      
      console.log('🔍 Processing all results from edge function:', {
        totalResults: freshResults.length,
        sampleResult: freshResults[0] ? {
          title: freshResults[0].title,
          vendor_source: freshResults[0].vendor_source
        } : null,
        vendorSources: freshResults.map(r => r.vendor_source).filter((v, i, a) => a.indexOf(v) === i)
      });
      
      // Only cache results if no subcategory is provided
      if (!subcategory) {
        const { error: upsertError } = await supabase
          .from('vendor_cache')
          .upsert(
            {
              category: searchCategory.toLowerCase(),
              city: searchCity,
              state: searchState,
              location_code: locationCode,
              search_results: allResults,
            },
            {
              onConflict: 'category,city,state,location_code'
            }
          );

        if (upsertError) {
          console.error('Cache upsert error:', upsertError);
          toast({
            title: "Warning",
            description: "Results were found but couldn't be cached. This won't affect your search.",
            variant: "default",
          });
        }
      }

      return allResults as SearchResult[];
    } else {
      console.log('No Google results or invalid results format:', freshResults);
      return [];
    }
  };

  const fetchInstagramVendors = async (searchCategory: string, searchCity: string, searchState: string, subcategory?: string): Promise<SearchResult[]> => {
    // Map search categories to Instagram vendor categories
    const categoryMapping: { [key: string]: string[] } = {
      'photographer': ['photographers', 'wedding-photographers'],
      'wedding planner': ['wedding-planners', 'event-planners'],
      'videographer': ['videographers', 'wedding-videographers'],
      'florist': ['florists', 'wedding-florists'],
      'caterer': ['caterers', 'wedding-caterers'],
      'venue': ['venues', 'wedding-venues'],
      'dj': ['djs', 'wedding-djs'],
      'band': ['bands', 'wedding-bands'],
      'cake': ['cake-designers', 'wedding-cakes'],
      'makeup': ['makeup-artists', 'wedding-makeup'],
      'hair': ['hair-stylists', 'wedding-hair'],
      'decorator': ['wedding-decorators', 'decorators'],
      'decoration': ['wedding-decorators', 'decorators']
    };

    // Find matching Instagram categories
    let instagramCategories: string[] = [];
    for (const [key, categories] of Object.entries(categoryMapping)) {
      if (searchCategory.toLowerCase().includes(key)) {
        instagramCategories = categories;
        break;
      }
    }

    if (instagramCategories.length === 0) {
      console.log('❌ No Instagram vendor categories found for search category:', searchCategory);
      console.log('📋 Available category mappings:', Object.keys(categoryMapping));
      return [];
    }

    console.log('✅ Found Instagram categories for search:', { searchCategory, instagramCategories });

    try {
      console.log('🔍 Fetching Instagram vendors for categories:', instagramCategories, { subcategory, searchCity, searchState });
      
      // First, let's do a test query to see what categories exist in the table
      console.log('🔍 Testing database connection and available categories...');
      const { data: testData, error: testError } = await (supabase as any)
        .from('instagram_vendors')
        .select('category')
        .limit(5);
      
      console.log('📊 Test query result:', { testError, categories: testData?.map(d => d.category) });
      
      // Use type assertion to bypass TypeScript strict typing for instagram_vendors table
      let query = (supabase as any)
        .from('instagram_vendors')
        .select('*');

      // Filter by category using OR condition for multiple possible categories
      if (instagramCategories.length === 1) {
        console.log('🔍 Using single category filter:', instagramCategories[0]);
        query = query.eq('category', instagramCategories[0]);
      } else {
        console.log('🔍 Using multiple category filter:', instagramCategories);
        // Use 'in' operator for multiple categories
        query = query.in('category', instagramCategories);
      }

      // Apply location filtering if city and state are provided
      if (searchCity && searchState) {
        // Use proper Supabase filtering for city AND state
        query = query
          .ilike('city', `%${searchCity}%`)
          .ilike('state', `%${searchState}%`);
      }

      // Apply subcategory filtering if provided
      if (subcategory) {
        console.log('📸 Subcategory provided:', subcategory);
        console.log('📸 SKIPPING subcategory filter for Instagram vendors - showing ALL Instagram photographers');
        // For now, we'll include all Instagram photographers regardless of subcategory
        // In the future, we could add a photography_style column to instagram_vendors table
        // and filter by that field
      } else {
        console.log('📸 No subcategory provided - showing ALL Instagram photographers');
      }

      console.log('📊 Executing Instagram query with limit 20...');
      const { data: instagramVendors, error } = await query.limit(20);
      
      console.log('📊 Instagram query result:', { 
        error, 
        dataCount: instagramVendors?.length || 0,
        firstVendor: instagramVendors?.[0] ? {
          id: instagramVendors[0].id,
          business_name: instagramVendors[0].business_name,
          category: instagramVendors[0].category,
          city: instagramVendors[0].city,
          state: instagramVendors[0].state
        } : null
      });
      
      if (error) {
        console.error('❌ Error fetching Instagram vendors:', error);
        return [];
      }

      if (!instagramVendors || instagramVendors.length === 0) {
        console.log('❌ No Instagram vendors found in database');
        console.log('🔍 Query details:', { instagramCategories, searchCity, searchState });
        return [];
      }

      console.log(`📸 Found ${instagramVendors.length} Instagram vendors`);
      
      // Transform Instagram vendors to SearchResult format with type assertions
      const instagramResults: SearchResult[] = instagramVendors.map((vendor: any) => {
        // Get vendor type for description
        const vendorType = vendor.category === 'photographers' ? 'photographer' :
                          vendor.category === 'wedding-planners' ? 'wedding planner' :
                          vendor.category === 'florists' ? 'florist' :
                          vendor.category === 'videographers' ? 'videographer' :
                          'wedding vendor';

        return {
          title: vendor.business_name || vendor.instagram_handle,
          description: vendor.bio || `Wedding ${vendorType} on Instagram with ${vendor.follower_count || 0} followers`,
          rating: undefined, // Instagram vendors don't have Google ratings
          phone: vendor.phone,
          address: vendor.location || `${vendor.city}, ${vendor.state}`,
          url: vendor.website_url,
          place_id: `instagram_${vendor.id}`, // Unique identifier for Instagram vendors
          main_image: vendor.profile_image_url,
          images: vendor.profile_image_url ? [vendor.profile_image_url] : [],
          snippet: vendor.bio,
          latitude: undefined,
          longitude: undefined,
          business_hours: undefined,
          price_range: '$$-$$$', // Default for wedding vendors
          payment_methods: undefined,
          service_area: [vendor.city, vendor.state].filter(Boolean),
          categories: [vendor.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())],
          reviews: undefined,
          year_established: undefined,
          email: vendor.email,
          city: vendor.city,
          state: vendor.state,
          postal_code: undefined,
          // Instagram-specific fields
          instagram_handle: vendor.instagram_handle,
          follower_count: vendor.follower_count,
          post_count: vendor.post_count,
          is_verified: vendor.is_verified,
          is_business_account: vendor.is_business_account,
          bio: vendor.bio,
          profile_image_url: vendor.profile_image_url,
          vendor_source: 'instagram' as const
        };
      });
      
      console.log(`✨ Transformed ${instagramResults.length} Instagram vendors`);
      return instagramResults;
    } catch (error) {
      console.error('Error processing Instagram vendors:', error);
      return [];
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isSearching) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setIsSearching(true);
    
    try {
      const locationCode = 2840;
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
  );
};
