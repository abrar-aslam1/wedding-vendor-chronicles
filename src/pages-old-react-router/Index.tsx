import { MainNav } from "@/components/MainNav";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchSection } from "@/components/home/SearchSection";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead isHomePage={true} />
      <MainNav />
      <main>
        {/* Mobile and Tablet layout */}
        <div className="lg:hidden">
          <div className="flex flex-col">
            <HeroSection />
            <div className="py-6 space-y-6 md:py-10 md:space-y-10">
              <SearchSection />
              <CategoriesGrid />
            </div>
          </div>
        </div>
        
        {/* Desktop layout */}
        <div className="hidden lg:block">
          <HeroSection />
          <SearchSection />
          <CategoriesGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
