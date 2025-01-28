import { SearchResults } from "@/components/search/SearchResults";

export const SearchSection = () => {
  return (
    <section className="relative z-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mt-8">
          <SearchResults results={[]} isSearching={false} />
        </div>
      </div>
    </section>
  );
};