
import { LocationHeader } from "@/components/search/LocationHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SearchSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative z-20 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <LocationHeader />
        <div className="mt-8 text-center">
          <p className="text-lg mb-6">Looking for wedding vendors in your area? Browse our directory by state.</p>
          <Button 
            onClick={() => navigate("/states")} 
            className="bg-wedding-primary hover:bg-wedding-primary/90 text-white"
          >
            Browse Vendors by State
          </Button>
        </div>
      </div>
    </section>
  );
}
