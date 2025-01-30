import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";
import { SearchResult } from "@/types/search";
import { searchVendors } from "@/utils/dataForSeoApi";
import { LoadingState } from "./LoadingState";
import { useToast } from "@/hooks/use-toast";
import { SearchHeader } from "./SearchHeader";

export const SearchContainer = () => {
  const { category, city, state } = useParams<{ category: string; city?: string; state?: string }>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setIsSearching(true);
    try {
      const results = await searchVendors(category, `${city}, ${state}`);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <SearchHeader subcategory={selectedSubcategory} />
      <SearchForm 
        onSearch={handleSearch} 
        isSearching={isSearching}
      />
      {isSearching ? (
        <LoadingState />
      ) : (
        <SearchResults 
          results={searchResults} 
          isSearching={isSearching} 
          subcategory={selectedSubcategory}
        />
      )}
    </div>
  );
};