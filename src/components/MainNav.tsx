import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const categories = [
  "Wedding Planners",
  "Photographers",
  "Videographers",
  "Florists",
  "Caterers",
  "Venues",
  "DJs & Bands",
  "Cake Designers",
  "Bridal Shops",
  "Makeup Artists",
  "Hair Stylists",
];

export function MainNav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Heart className="h-6 w-6 text-wedding-primary" />
            <span className="ml-2 text-xl font-semibold text-wedding-text">
              FindMyWeddingVendor
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-4">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={`/${category.toLowerCase().replace(/\s+&?\s+/g, "-")}`}
                className="text-wedding-text hover:text-wedding-primary transition-colors"
              >
                {category}
              </Link>
            ))}
            <Button variant="outline" className="border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white">
              List Your Business
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}