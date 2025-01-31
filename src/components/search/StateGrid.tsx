import { useEffect, useState } from "react";
import { StateCard } from "./StateCard";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface LocationMetadata {
  state: string;
  vendor_count: number | null;
  popular_cities: string[];
  average_rating: number | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  id: string;
  city: string | null;
}

export const StateGrid = () => {
  const [states, setStates] = useState<LocationMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from('location_metadata')
        .select('*')
        .is('city', null);

      if (error) {
        console.error('Error fetching states:', error);
        return;
      }

      // Transform the data to ensure popular_cities is always a string array
      const transformedData = data?.map(item => ({
        ...item,
        popular_cities: Array.isArray(item.popular_cities) 
          ? item.popular_cities 
          : Array.isArray(item.popular_cities as unknown) 
            ? (item.popular_cities as string[])
            : []
      })) || [];

      setStates(transformedData as LocationMetadata[]);
      setLoading(false);
    };

    fetchStates();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
        ))}
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