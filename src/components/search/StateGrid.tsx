
import { useEffect, useState } from "react";
import { StateCard } from "./StateCard";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

interface LocationMetadata {
  id: string;
  state: string;
  vendor_count: number;
  popular_cities: string[];
  average_rating: number;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export const StateGrid = () => {
  const [states, setStates] = useState<LocationMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        console.log('Fetching state data from location_metadata...');
        
        const { data, error } = await supabase
          .from('location_metadata')
          .select('*')
          .is('city', null)
          .order('vendor_count', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching from location_metadata:', error);
          // Fallback to vendors table if location_metadata fails
          console.log('Falling back to vendors table...');
          return await fetchStatesFromVendors();
        }

        if (!data || data.length === 0) {
          console.log('No state data found in location_metadata, falling back to vendors table...');
          return await fetchStatesFromVendors();
        }

        console.log(`Successfully fetched ${data.length} states from location_metadata`);

        const transformedData = data.map(item => ({
          ...item,
          popular_cities: Array.isArray(item.popular_cities) 
            ? item.popular_cities 
            : typeof item.popular_cities === 'object' && item.popular_cities !== null
              ? Object.values(item.popular_cities as Record<string, string>)
              : []
        }));

        setStates(transformedData as LocationMetadata[]);
        setError(null);
      } catch (err) {
        console.error('Unexpected error fetching state data:', err);
        // Try fallback as last resort
        await fetchStatesFromVendors();
      } finally {
        setLoading(false);
      }
    };

    const fetchStatesFromVendors = async () => {
      try {
        console.log('Fetching states directly from vendors table...');
        
        const { data: vendors, error: vendorError } = await supabase
          .from('vendors')
          .select('state, city')
          .not('state', 'is', null)
          .not('city', 'is', null);

        if (vendorError) {
          throw vendorError;
        }

        if (!vendors || vendors.length === 0) {
          setError('No vendor data available.');
          return;
        }

        // Group vendors by state
        const stateGroups = vendors.reduce((acc, vendor) => {
          const state = vendor.state.trim();
          const city = vendor.city.trim();
          
          if (!acc[state]) {
            acc[state] = {
              vendor_count: 0,
              cities: new Set()
            };
          }
          
          acc[state].vendor_count++;
          acc[state].cities.add(city);
          
          return acc;
        }, {} as Record<string, { vendor_count: number; cities: Set<string> }>);

        // Transform to LocationMetadata format
        const stateData = Object.entries(stateGroups)
          .map(([state, data]) => ({
            id: `fallback-${state}`,
            state,
            city: null,
            vendor_count: data.vendor_count,
            popular_cities: Array.from(data.cities).slice(0, 5),
            average_rating: 4.5,
            seo_description: `Find wedding vendors in ${state}. Browse ${data.vendor_count} verified professionals.`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          .sort((a, b) => b.vendor_count - a.vendor_count)
          .slice(0, 50);

        console.log(`Generated ${stateData.length} states from vendors data`);
        setStates(stateData);
        setError(null);
        
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        setError('Unable to load state data. Please try again later.');
        toast({
          title: "Error",
          description: "Unable to load state data. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchStates();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="bg-wedding-primary text-white px-4 py-2 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (states.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No states available at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {states.map((state) => (
        <StateCard
          key={state.id}
          state={state.state}
          vendorCount={state.vendor_count || 0}
          popularCities={state.popular_cities}
          averageRating={state.average_rating || 4.5}
        />
      ))}
    </div>
  );
};
