import { SearchResults } from "@/components/search/SearchResults";

export const SearchSection = () => {
  return (
    <section className="relative z-20 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mt-4 md:mt-8">
          <SearchResults results={[]} isSearching={false} />
        </div>
      </div>
    </section>
  );
};