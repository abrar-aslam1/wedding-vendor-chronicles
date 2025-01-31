import { StateGrid } from "@/components/search/StateGrid";
import { LocationHeader } from "@/components/search/LocationHeader";

export const SearchSection = () => {
  return (
    <section className="relative z-20 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <LocationHeader />
        <div className="mt-8">
          <StateGrid />
        </div>
      </div>
    </section>
  );
};