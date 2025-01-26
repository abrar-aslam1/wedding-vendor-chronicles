import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[500px] md:h-[600px] bg-gradient-to-br from-[#ee9ca7] via-[#ffdde1] to-[#ffd1dc] overflow-hidden px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#ee9ca7]/80 via-[#ffdde1]/80 to-[#ffd1dc]/80"></div>
      
      {/* Content */}
      <div className="container mx-auto h-full flex flex-col md:flex-row items-center justify-between relative py-12 md:py-0">
        <div className="max-w-2xl w-full md:text-left text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-[#1A1F2C]/90 text-white backdrop-blur-sm mb-4 text-sm font-medium">
            Find Your Perfect Match
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-[#1A1F2C] leading-tight">
            Discover Trusted Wedding Vendors
          </h1>
          <div className="bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg p-4 mb-8">
            <p className="text-white font-medium text-base md:text-lg">
              Let us guide you to find the perfect vendors for your special day. Our platform connects you with:
            </p>
            <ul className="mt-2 space-y-2 text-white/90 text-sm md:text-base">
              <li>✓ Pre-screened professional vendors</li>
              <li>✓ Real reviews from couples</li>
              <li>✓ Direct communication channels</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              variant="default" 
              className="bg-white text-[#1A1F2C] hover:bg-wedding-light hover:text-[#333333] transition-all duration-300 w-full sm:w-auto"
            >
              Browse Vendors
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#1A1F2C] text-[#1A1F2C] hover:bg-white/10 backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Decorative Image */}
        <div className="hidden md:flex items-center justify-center mt-8 md:mt-0">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
            <img 
              src="/lovable-uploads/9235bfb6-3b99-4583-9d5d-add471a451ec.png" 
              alt="Wedding Vendor Search Illustration" 
              className="w-48 h-48 lg:w-64 lg:h-64 object-contain relative z-10"
            />
          </div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute -bottom-16 -right-16 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-8 -left-8 w-24 md:w-48 h-24 md:h-48 bg-white/10 rounded-full blur-2xl"></div>
    </section>
  );
};