import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchButtonProps {
  isSearching: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const SearchButton = ({ isSearching, disabled, onClick }: SearchButtonProps) => {
  return (
    <Button 
      className="w-full h-12 bg-wedding-primary hover:bg-wedding-accent transition-all duration-300 rounded-xl"
      onClick={onClick}
      disabled={disabled}
    >
      {isSearching ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-5 w-5" />
          Find Vendors
        </>
      )}
    </Button>
  );
};