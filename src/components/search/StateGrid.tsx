
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
          .limit(20);

        if (error) {
          console.error('Error fetching states:', error);
          setError('Failed to load state data. Please try again later.');
          toast({
            title: "Error",
            description: "Failed to load state data. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        if (!data || data.length === 0) {
          console.log('No state data found in the database');
          setError('No state data available.');
          setLoading(false);
          return;
        }

        console.log(`Successfully fetched ${data.length} states`);

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
        setError('An unexpected error occurred. Please try again later.');
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading states.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
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
        />
      ))}
    </div>
  );
};
