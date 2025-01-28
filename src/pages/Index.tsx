import { MainNav } from "@/components/MainNav";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchSection } from "@/components/home/SearchSection";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <main className="pt-16"> {/* Added padding-top to account for navbar */}
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2">
            <HeroSection />
          </div>
          <div className="lg:w-1/2">
            <SearchSection />
            <CategoriesGrid />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;