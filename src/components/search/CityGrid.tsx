import { useEffect, useState } from "react";
import { CityCard } from "./CityCard";
import { supabase } from "@/integrations/supabase/client";

interface CityMetadata {
  city: string;
  state: string;
  vendor_count: number;
}

interface CityGridProps {
  state: string;
}

export const CityGrid = ({ state }: CityGridProps) => {
  const [cities, setCities] = useState<CityMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('location_metadata')
        .select('*')
        .eq('state', state)
        .not('city', 'is', null);

      if (error) {
        console.error('Error fetching cities:', error);
        return;
      }

      setCities(data || []);
      setLoading(false);
    };

    fetchCities();
  }, [state]);

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
      {cities.map((city) => (
        <CityCard
          key={`${city.city}-${city.state}`}
          city={city.city}
          state={city.state}
          vendorCount={city.vendor_count}
        />
      ))}
    </div>
  );
};