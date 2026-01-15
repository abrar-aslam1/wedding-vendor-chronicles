import { MainNav } from "@/components/MainNav";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { SEOContent } from "@/components/home/SEOContent";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead isHomePage={true} />
      <MainNav />
      <main>
        {/* HeroSection now contains the SearchSection internally */}
        <HeroSection />
        <CategoriesGrid />
        {/* SEO-rich content for search engines */}
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
