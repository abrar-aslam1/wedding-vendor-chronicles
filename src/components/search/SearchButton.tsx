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
      className={`w-full h-14 transition-all duration-300 rounded-xl text-lg font-semibold shadow-lg
        ${disabled 
          ? 'bg-gray-200 text-gray-500' 
          : 'bg-wedding-primary hover:bg-wedding-accent hover:scale-[1.02] hover:shadow-xl'
        }
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {isSearching ? (
        <>
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-6 w-6" />
          Find Vendors
        </>
      )}
    </Button>
  );
};