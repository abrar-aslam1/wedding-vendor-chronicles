import { Button } from "@/components/ui/button";
import { Search, Heart, Calendar, Users2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-wedding-primary via-wedding-secondary to-[#ffd1dc] overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552')] bg-cover bg-center"
        style={{ filter: 'brightness(0.7)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32 pb-12 md:pb-24">
        <div className="max-w-3xl mx-auto text-center space-y-2 md:space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Find Your Perfect
            <br />
            Wedding Vendors
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Book your dream wedding team
            <br />
            with trusted professionals
          </p>

          {/* Features Grid - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Easy Search"
              description="Find vendors instantly"
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Save Favorites"
              description="Keep track of your picks"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Book Online"
              description="Schedule appointments"
            />
            <FeatureCard
              icon={<Users2 className="h-6 w-6" />}
              title="Read Reviews"
              description="From real couples"
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-transform">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-wedding-primary/20 text-wedding-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-wedding-text">{title}</h3>
      <p className="text-sm text-wedding-text/70">{description}</p>
    </div>
  );
};