import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  totalResults: number;
  currentResults: number;
}

export const LoadMoreButton = ({ 
  onLoadMore, 
  isLoading, 
  hasMore, 
  totalResults, 
  currentResults 
}: LoadMoreButtonProps) => {
  if (!hasMore) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Showing all {totalResults} results
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">
        Showing {currentResults} of {totalResults} results
      </p>
      <Button 
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          `Load More (${totalResults - currentResults} remaining)`
        )}
      </Button>
    </div>
  );
};