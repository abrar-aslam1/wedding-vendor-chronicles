import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const vendors = [
  {
    id: 1,
    name: "Golden Hour Photography",
    category: "Photographers",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    location: "Houston, TX",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Bloom Floral Designs",
    category: "Florists",
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833",
    location: "Dallas, TX",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Gourmet Kitchen Catering",
    category: "Caterers",
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840",
    location: "Los Angeles, CA",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Dream Venues",
    category: "Venues",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    location: "Miami, FL",
    rating: 4.9,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-wedding-primary to-wedding-secondary">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">
              Find Your Perfect Wedding Vendors
            </h1>
            <p className="text-xl mb-8">
              Connect with trusted wedding professionals in your area
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="default" className="bg-white text-wedding-primary hover:bg-wedding-light">
                Browse Vendors
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-wedding-primary">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-wedding-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 p-6 bg-white rounded-lg shadow-lg">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-primary"
                />
              </div>
              <Button className="bg-wedding-primary hover:bg-wedding-accent">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-wedding-text">Featured Wedding Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={vendor.image} 
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-wedding-text">{vendor.name}</CardTitle>
                  <CardDescription>{vendor.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{vendor.location}</span>
                    <span className="text-sm font-semibold text-wedding-primary">
                      ★ {vendor.rating}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button className="bg-wedding-primary hover:bg-wedding-accent">
              View All Vendors
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;