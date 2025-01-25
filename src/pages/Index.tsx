import { MainNav } from "@/components/MainNav";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchSection } from "@/components/home/SearchSection";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <HeroSection />
      <SearchSection />
      <CategoriesGrid />
    </div>
  );
};

export default Index;