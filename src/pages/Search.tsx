import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { searchVendors } from "@/utils/dataForSeoApi";
import { MainNav } from "@/components/MainNav";
import { SearchHeader } from "@/components/search/SearchHeader";
import { LocationSearch } from "@/components/search/LocationSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchResult } from "@/types/search";
import { locationCodes } from "@/config/locations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function Search() {
  const { category } = useParams();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("Texas");
  const [selectedCity, setSelectedCity] = useState<string>("Dallas");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

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
      const locationString = `${selectedCity}, ${selectedState}`;
      const results = await searchVendors(category?.replace(/-/g, " ") || "", locationString);
      
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
      setCurrentPage(1);
      
      toast({
        title: "Search completed",
        description: `Found ${processedResults.length} vendors in ${locationString}`,
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
  }, [category, selectedState, selectedCity]);

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const totalPages = Math.ceil(searchResults.length / resultsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <SearchHeader />
        <div className="max-w-7xl mx-auto">
          <LocationSearch
            selectedState={selectedState}
            selectedCity={selectedCity}
            isSearching={isSearching}
            onStateChange={setSelectedState}
            onCityChange={setSelectedCity}
            onSearch={handleSearch}
          />
          <SearchResults results={paginatedResults} isSearching={isSearching} />
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isFirstPage) {
                          setCurrentPage(p => p - 1);
                        }
                      }}
                      className={cn(
                        isFirstPage && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isLastPage) {
                          setCurrentPage(p => p + 1);
                        }
                      }}
                      className={cn(
                        isLastPage && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}