
import { LocationHeader } from "@/components/search/LocationHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SearchSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative z-20 px-6 py-6 md:px-8 md:py-10 md:bg-white lg:py-16">
      <div className="max-w-md mx-auto md:max-w-3xl lg:max-w-7xl">
        <div className="md:bg-gradient-to-br md:from-wedding-light md:to-wedding-secondary/20 md:rounded-2xl md:p-8 lg:rounded-3xl lg:p-16 md:relative md:overflow-hidden">
          {/* Desktop decorative element */}
          <div className="hidden lg:block absolute -right-20 -top-20 w-64 h-64 bg-wedding-primary/10 rounded-full blur-2xl" />
          
          <div className="md:text-center lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center relative z-10">
            <div>
              <LocationHeader />
              <div className="mt-6 text-center md:text-center lg:text-left">
                <p className="text-base mb-4 text-wedding-text/80 md:text-lg md:mb-6 lg:text-xl lg:mb-6">Looking for wedding vendors in your area?</p>
                <Button 
                  onClick={() => navigate("/states")} 
                  className="bg-wedding-primary hover:bg-wedding-primary/90 text-white w-full md:w-auto md:px-10 md:py-4 lg:w-auto lg:px-12 lg:py-6 md:text-base lg:text-lg"
                >
                  Browse Vendors by State
                </Button>
              </div>
            </div>
            
            <div className="hidden md:block md:mt-8 lg:mt-0 lg:block">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-wedding-primary">5,000+</div>
                    <div className="text-wedding-text/70">Trusted Vendors</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-wedding-accent">50</div>
                    <div className="text-wedding-text/70">States Covered</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8 md:mt-0 lg:mt-4">
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-wedding-primary">1M+</div>
                    <div className="text-wedding-text/70">Happy Couples</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-wedding-accent">4.9</div>
                    <div className="text-wedding-text/70">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
