import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative h-[600px] bg-gradient-to-br from-wedding-primary via-wedding-accent to-wedding-secondary overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-wedding-primary/80 via-wedding-accent/80 to-wedding-secondary/80"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm mb-4 text-sm font-medium">
            Find Your Perfect Match
          </span>
          <h1 className="text-6xl font-bold mb-6 text-white leading-tight">
            Discover Trusted Wedding Vendors
          </h1>
          <p className="text-xl mb-8 text-white/90 leading-relaxed">
            Connect with the best wedding professionals in your area. From photographers to florists, 
            we've got everything you need for your special day.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant="default" 
              className="bg-white text-wedding-primary hover:bg-wedding-light hover:text-wedding-primary/90 transition-all duration-300"
            >
              Browse Vendors
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
    </section>
  );
};