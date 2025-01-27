import { SearchResults } from "@/components/search/SearchResults";

export const SearchSection = () => {
  return (
    <section className="relative -mt-16 md:-mt-20 z-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mt-8">
            <SearchResults results={[]} isSearching={false} />
          </div>
        </div>
      </div>
    </section>
  );
};