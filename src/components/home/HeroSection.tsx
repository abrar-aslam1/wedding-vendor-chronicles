import { Button } from "@/components/ui/button";
import { Search, Heart, Calendar, Users2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[500px] md:h-[600px] bg-gradient-to-br from-[#ee9ca7] via-[#ffdde1] to-[#ffd1dc] overflow-hidden px-4 py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#ee9ca7]/80 via-[#ffdde1]/80 to-[#ffd1dc]/80"></div>
      
      {/* Content */}
      <div className="container mx-auto h-full flex flex-col md:flex-row items-center justify-between relative gap-12 md:gap-8 pb-8">
        <div className="max-w-2xl w-full space-y-8 md:text-left text-center">
          <span className="inline-block px-6 py-2.5 rounded-full bg-[#1A1F2C]/90 text-white backdrop-blur-sm text-sm font-medium">
            Find Your Perfect Match
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1F2C] leading-tight">
            Discover Trusted Wedding Vendors
          </h1>
          <div className="bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <p className="text-white font-medium text-base md:text-lg">
              Let us guide you to find the perfect vendors for your special day. Our platform connects you with:
            </p>
            <ul className="space-y-3 text-white/90 text-sm md:text-base">
              <li>✓ Pre-screened professional vendors</li>
              <li>✓ Real reviews from couples</li>
              <li>✓ Direct communication channels</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Button 
              size="lg" 
              variant="default" 
              className="bg-white text-[#1A1F2C] hover:bg-wedding-light hover:text-[#333333] transition-all duration-300 w-full sm:w-auto px-8"
            >
              Browse Vendors
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#1A1F2C] text-[#1A1F2C] hover:bg-white/10 backdrop-blur-sm transition-all duration-300 w-full sm:w-auto px-8"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Interactive Feature Display */}
        <div className="hidden md:block relative">
          <div className="relative w-[320px] h-[400px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-wedding-primary to-wedding-secondary"></div>
            
            {/* Feature Icons */}
            <div className="relative z-10 p-8 mt-12 space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm transition-transform hover:scale-105">
                <div className="p-3 bg-wedding-primary/20 rounded-full">
                  <Search className="w-6 h-6 text-wedding-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1F2C]">Smart Search</h3>
                  <p className="text-sm text-gray-600">Find vendors instantly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm transition-transform hover:scale-105">
                <div className="p-3 bg-wedding-primary/20 rounded-full">
                  <Heart className="w-6 h-6 text-wedding-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1F2C]">Save Favorites</h3>
                  <p className="text-sm text-gray-600">Keep track of your picks</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm transition-transform hover:scale-105">
                <div className="p-3 bg-wedding-primary/20 rounded-full">
                  <Calendar className="w-6 h-6 text-wedding-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1F2C]">Easy Booking</h3>
                  <p className="text-sm text-gray-600">Schedule appointments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm transition-transform hover:scale-105">
                <div className="p-3 bg-wedding-primary/20 rounded-full">
                  <Users2 className="w-6 h-6 text-wedding-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1F2C]">Real Reviews</h3>
                  <p className="text-sm text-gray-600">From verified couples</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-wedding-primary/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-wedding-secondary/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute -bottom-16 -right-16 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-8 -left-8 w-24 md:w-48 h-24 md:h-48 bg-white/10 rounded-full blur-2xl"></div>
    </section>
  );
};
