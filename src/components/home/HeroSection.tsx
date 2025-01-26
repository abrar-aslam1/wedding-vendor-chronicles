import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative h-[600px] bg-gradient-to-br from-[#ee9ca7] via-[#ffdde1] to-[#ffd1dc] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#ee9ca7]/80 via-[#ffdde1]/80 to-[#ffd1dc]/80"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
        <div className="max-w-2xl text-left">
          <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-[#1A1F2C] backdrop-blur-sm mb-4 text-sm font-medium">
            Find Your Perfect Match
          </span>
          <h1 className="text-6xl font-bold mb-6 text-[#1A1F2C] leading-tight">
            Discover Trusted Wedding Vendors
          </h1>
          <p className="text-xl mb-8 text-[#333333] leading-relaxed">
            Connect with the best wedding professionals in your area. From photographers to florists, 
            we've got everything you need for your special day.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant="default" 
              className="bg-white text-[#1A1F2C] hover:bg-wedding-light hover:text-[#333333] transition-all duration-300"
            >
              Browse Vendors
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#1A1F2C] text-[#1A1F2C] hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Decorative Store Icon */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
            <Store className="w-64 h-64 text-[#1A1F2C] opacity-80 relative z-10" />
          </div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
    </section>
  );
};