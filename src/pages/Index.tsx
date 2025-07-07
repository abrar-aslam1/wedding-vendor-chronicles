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
      <main className="pt-16">
        {/* Mobile and Tablet layout */}
        <div className="lg:hidden">
          <div className="flex flex-col">
            <HeroSection />
            <div className="py-8 space-y-8 md:py-12 md:space-y-12">
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