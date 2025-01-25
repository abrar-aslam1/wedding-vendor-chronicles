import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      
      <main>
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
      </main>
    </div>
  );
};

export default Index;