import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { locationCodes, searchVendors } from "@/utils/dataForSeoApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const categories = [
  {
    id: 1,
    name: "Wedding Planners",
    icon: "🎯",
    description: "Professional planners to orchestrate your perfect day",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
  },
  {
    id: 2,
    name: "Photographers",
    icon: "📸",
    description: "Capture every magical moment",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  },
  {
    id: 3,
    name: "Videographers",
    icon: "🎥",
    description: "Create lasting memories in motion",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
  },
  {
    id: 4,
    name: "Florists",
    icon: "💐",
    description: "Beautiful floral arrangements for your special day",
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833",
  },
  {
    id: 5,
    name: "Caterers",
    icon: "🍽️",
    description: "Delicious cuisine for your reception",
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840",
  },
  {
    id: 6,
    name: "Venues",
    icon: "🏰",
    description: "Perfect locations for your ceremony and reception",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
  },
  {
    id: 7,
    name: "DJs & Bands",
    icon: "🎵",
    description: "Entertainment to keep the party going",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
  },
  {
    id: 8,
    name: "Cake Designers",
    icon: "🎂",
    description: "Beautiful and delicious wedding cakes",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d",
  },
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Please select both state and city",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const cityCode = locationCodes[selectedState].cities[selectedCity];
      const results = await searchVendors("wedding planner", cityCode);
      
      toast({
        title: "Search completed",
        description: "Results have been saved to your history",
      });
    } catch (error) {
      toast({
        title: "Error searching vendors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      
      {/* Hero Section */}
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

      {/* Enhanced Search Section */}
      <section className="py-16 bg-wedding-light relative -mt-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(locationCodes).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={!selectedState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedState &&
                      Object.keys(locationCodes[selectedState].cities).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full bg-wedding-primary hover:bg-wedding-accent transition-all duration-300"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search Vendors"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-wedding-text">Wedding Vendor Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 text-4xl">{category.icon}</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-wedding-text">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full text-wedding-primary hover:text-wedding-accent">
                    Browse {category.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
