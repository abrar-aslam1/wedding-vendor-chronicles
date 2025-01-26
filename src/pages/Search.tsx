import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { searchVendors } from "@/utils/dataForSeoApi";
import { MainNav } from "@/components/MainNav";
import { SearchHeader } from "@/components/search/SearchHeader";
import { LocationSearch } from "@/components/search/LocationSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchResult } from "@/types/search";

export default function Search() {
  const { category } = useParams();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("Texas");
  const [selectedCity, setSelectedCity] = useState<string>("Dallas");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Please select both state and city",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchVendors(category?.replace(/-/g, " ") || "");
      
      const items = results?.tasks?.[0]?.result?.[0]?.items || [];
      const processedResults = items.map((item: any) => ({
        title: item.title,
        description: item.snippet,
        rating: item.rating,
        address: item.address,
        url: item.url,
        place_id: item.place_id
      }));
      
      setSearchResults(processedResults);
      
      toast({
        title: "Search completed",
        description: `Found ${processedResults.length} vendors`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Error searching vendors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (category && selectedState && selectedCity) {
      handleSearch();
    }
  }, [category]);

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <SearchHeader />
        <div className="max-w-3xl mx-auto">
          <LocationSearch
            selectedState={selectedState}
            selectedCity={selectedCity}
            isSearching={isSearching}
            onStateChange={setSelectedState}
            onCityChange={setSelectedCity}
            onSearch={handleSearch}
          />
          <SearchResults results={searchResults} isSearching={isSearching} />
        </div>
      </div>
    </div>
  );
}