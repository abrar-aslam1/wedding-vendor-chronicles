
import { StateGrid } from "@/components/search/StateGrid";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

export default function States() {
  return (
    <>
      <SEOHead 
        title="Browse Wedding Vendors by State" 
        description="Find the perfect wedding vendors in your state. Browse our comprehensive directory of wedding professionals across the United States."
      />
      <MainNav />
      <div className="pt-20 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-wedding-text mb-2">Find Wedding Vendors by State</h1>
          <p className="text-gray-600 mb-8">Select a state to browse wedding vendors in your area</p>
          <StateGrid />
        </div>
      </div>
      <Footer />
    </>
  );
}
