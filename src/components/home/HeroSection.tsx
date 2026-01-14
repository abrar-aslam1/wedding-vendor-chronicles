import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SearchSection } from "@/components/home/SearchSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "Photographer",
  "Venue",
  "Florist",
  "Caterer",
  "DJ/Band",
  "Planner",
  "Videographer",
  "Makeup Artist",
  "Hair Stylist",
  "Bartender",
  "Decorator",
  "Coffee Cart",
  "Desert Cart"
];

export const HeroSection = () => {
  const [currentCategory, setCurrentCategory] = useState("");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Typewriter effect
  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseBeforeDelete = 2000;
    const pauseBeforeType = 500;

    if (!isDeleting && charIndex === categories[categoryIndex].length) {
      // Pause before deleting
      const timeout = setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      // Move to next category
      setIsDeleting(false);
      setCategoryIndex((prev) => (prev + 1) % categories.length);
      const timeout = setTimeout(() => {}, pauseBeforeType);
      return () => clearTimeout(timeout);
    }

    // Type or delete character
    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      setCurrentCategory(categories[categoryIndex].substring(0, charIndex + (isDeleting ? -1 : 1)));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, categoryIndex]);

  const handleListBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to list your business",
        variant: "default",
      });
      navigate("/auth?returnUrl=/list-business");
      return;
    }

    navigate("/list-business");
  };

  return (
    <section 
      className="relative min-h-screen flex items-center pb-12 md:pb-16 lg:pb-20 -mt-28 pt-0"
      style={{ 
        background: "linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(93, 122, 149, 0.90) 50%, rgba(232, 212, 176, 0.85) 100%)",
        paddingTop: "calc(6rem + 112px)" // 6rem for mobile + navbar height + extra spacing
      }}
    >
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <div className="md:max-w-4xl md:mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:py-12">
          <div className="space-y-6 md:space-y-8 lg:space-y-8 text-center md:text-center lg:text-left max-w-2xl mx-auto md:mx-auto lg:mx-0 lg:max-w-none lg:pr-8">
            <div className="space-y-4 md:space-y-6 lg:space-y-6">
              <h2 className="font-body text-wedding-primary text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-widest mb-4 md:mb-6 lg:mb-6 stagger-1 font-bold">
                DISCOVER YOUR DREAM WEDDING TEAM
              </h2>
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-wedding-text leading-relaxed md:leading-relaxed lg:leading-relaxed tracking-tight stagger-2 drop-shadow-sm">
                Find Your Wedding
                <br />
                <span 
                  className="text-[#E8D4B0] font-black block mt-3 md:mt-4 pb-3 md:pb-4 lg:pb-4 inline-block" 
                  style={{ 
                    lineHeight: '1.4',
                    minHeight: '1.4em',
                    minWidth: '280px'
                  }}
                >
                  {currentCategory}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
            </div>
            
            <p className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-wedding-text/90 max-w-lg mx-auto md:mx-auto lg:mx-0 lg:max-w-xl px-2 sm:px-0 leading-relaxed stagger-3 font-medium">
              Connect with trusted wedding professionals who bring your vision to life—from photographers to florists and everything in between.
            </p>
          </div>

          <div className="mt-6 md:mt-8 lg:mt-0">
            {/* Replace old search form with new SearchSection */}
            <SearchSection />
            
            {/* Vendor CTA - Below Search Section */}
            <div className="mt-8 pt-8 text-center">
              <p className="text-wedding-text/85 text-sm mb-3 lg:text-base font-semibold">
                Are you a wedding vendor?
              </p>
              <Button
                onClick={handleListBusiness}
                size="lg"
                className="bg-wedding-primary hover:bg-wedding-primary/90 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base lg:text-lg min-h-[48px] animate-glow-pulse w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2 lg:h-6 lg:w-6" />
                <span>List Your Business</span>
              </Button>
              <p className="text-wedding-text/75 text-xs mt-2 lg:text-sm font-medium">
                Join thousands of vendors growing their business with us
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
