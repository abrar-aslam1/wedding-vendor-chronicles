import { SearchResults } from "./SearchResults";
import { SearchForm } from "./SearchForm";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";
import { SearchHeader } from "./SearchHeader";
import { LoadingState } from "./LoadingState";

export const SearchContainer = () => {
  const { category, subcategory, city, state } = useParams<{ 
    category: string; 
    subcategory?: string;
    city?: string; 
    state?: string; 
  }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      console.log('Initiating search for:', { cleanCategory, subcategory, city, state });
      fetchResults(cleanCategory, city, state, subcategory);
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
    
    const urlPath = selectedSubcategory 
      ? `/top-20/${formattedCategory}/${selectedSubcategory}/${selectedCity}/${selectedState}`
      : `/top-20/${formattedCategory}/${selectedCity}/${selectedState}`;
    
    navigate(urlPath);
  };

  const fetchResults = async (searchCategory: string, searchCity: string, searchState: string, subcategory?: string) => {
    console.log('Starting fetchResults with:', { searchCategory, searchCity, searchState, subcategory });
    setIsSearching(true);
    
    try {
      const locationCode = 2840;
      console.log('Using fixed location code:', locationCode);

      // Convert URL-formatted subcategory to proper format
      const formattedSubcategory = subcategory 
        ? subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : undefined;
      
      console.log('Formatted subcategory:', formattedSubcategory);

      // Fetch Google results and Instagram vendors in parallel
      const [googleResultsPromise, instagramResultsPromise] = await Promise.allSettled([
        fetchGoogleResults(searchCategory, searchCity, searchState, locationCode, formattedSubcategory),
        fetchInstagramVendors(searchCategory, searchCity, searchState, formattedSubcategory)
      ]);

      let googleResults: SearchResult[] = [];
      let instagramResults: SearchResult[] = [];

      // Handle Google results
      if (googleResultsPromise.status === 'fulfilled') {
        googleResults = googleResultsPromise.value;
        console.log(`✅ Google results: ${googleResults.length}`);
      } else {
        console.error('❌ Google results failed:', googleResultsPromise.reason);
      }

      // Handle Instagram results
      if (instagramResultsPromise.status === 'fulfilled') {
        instagramResults = instagramResultsPromise.value;
        console.log(`✅ Instagram results: ${instagramResults.length}`);
      } else {
        console.error('❌ Instagram results failed:', instagramResultsPromise.reason);
      }

      // Combine results - Instagram first as they're more wedding-focused
      const combinedResults = [...instagramResults, ...googleResults];
      console.log(`🔗 Combined results: ${combinedResults.length} total (${instagramResults.length} Instagram + ${googleResults.length} Google)`);

      setSearchResults(combinedResults);

      if (combinedResults.length === 0) {
        toast({
          title: "No Results",
          description: "No vendors found for your search criteria.",
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
    const { data: freshResults, error: searchError } = await supabase.functions.invoke('search-vendors', {
      body: requestPayload
    });
    const requestEndTime = Date.now();

    console.log(`⏱️ Request completed in ${requestEndTime - requestStartTime}ms`);
    console.log('📊 Google API search response:', { 
      resultsCount: freshResults?.length,
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
    // Only fetch Instagram vendors for photographers for now
    if (!searchCategory.toLowerCase().includes('photographer')) {
      console.log('Skipping Instagram vendors - not a photographer search');
      return [];
    }

    try {
      console.log('🔍 Fetching Instagram vendors for photographers...');
      
      // Use type assertion to bypass TypeScript strict typing for instagram_vendors table
      let query = (supabase as any)
        .from('instagram_vendors')
        .select('*')
        .eq('category', 'photographers');

      // Apply location filtering if city and state are provided
      if (searchCity && searchState) {
        // Use proper Supabase filtering for city AND state
        query = query
          .ilike('city', `%${searchCity}%`)
          .ilike('state', `%${searchState}%`);
      }

      const { data: instagramVendors, error } = await query.limit(20);
      
      if (error) {
        console.error('Error fetching Instagram vendors:', error);
        return [];
      }

      if (!instagramVendors || instagramVendors.length === 0) {
        console.log('No Instagram vendors found');
        return [];
      }

      console.log(`📸 Found ${instagramVendors.length} Instagram vendors`);
      
      // Transform Instagram vendors to SearchResult format with type assertions
      const instagramResults: SearchResult[] = instagramVendors.map((vendor: any) => ({
        title: vendor.business_name || vendor.instagram_handle,
        description: vendor.bio || `Wedding photographer on Instagram with ${vendor.follower_count || 0} followers`,
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
        price_range: '$$-$$$', // Default for wedding photographers
        payment_methods: undefined,
        service_area: [vendor.city, vendor.state].filter(Boolean),
        categories: ['Wedding Photography'],
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
      }));
      
      console.log(`✨ Transformed ${instagramResults.length} Instagram vendors`);
      return instagramResults;
    } catch (error) {
      console.error('Error processing Instagram vendors:', error);
      return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <SearchHeader subcategory={subcategory} />
      
      {(!city || !state) && (
        <div className="max-w-2xl mx-auto mb-8">
          <SearchForm 
            onSearch={handleSearch} 
            isSearching={isSearching} 
            preselectedCategory={category ? category.replace('top-20/', '').replace(/-/g, ' ') : undefined} 
          />
        </div>
      )}
      
      {isSearching ? (
        <LoadingState />
      ) : (
        <SearchResults results={searchResults} isSearching={isSearching} subcategory={subcategory} />
      )}
    </div>
  );
};
