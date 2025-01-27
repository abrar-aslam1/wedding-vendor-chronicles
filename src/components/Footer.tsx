import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/config/categories";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/fc1186f3-9e97-4be6-910e-9851d1205033.png" 
                alt="My Wedding Logo" 
                className="h-20"
              />
            </div>
            <p className="text-wedding-text text-sm">
              Your perfect wedding starts here. Find the best vendors for your special day.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-wedding-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-wedding-text mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <li key={category.slug}>
                  <Link 
                    to={`/search/${category.slug}`}
                    className="text-sm text-wedding-text hover:text-wedding-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-wedding-text mb-4">More Categories</h3>
            <ul className="space-y-2">
              {categories.slice(4, 8).map((category) => (
                <li key={category.slug}>
                  <Link 
                    to={`/search/${category.slug}`}
                    className="text-sm text-wedding-text hover:text-wedding-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-wedding-text">
            © {new Date().getFullYear()} My Wedding. Made with{" "}
            <Heart className="h-4 w-4 inline-block text-wedding-primary" /> for happy couples
          </p>
        </div>
      </div>
    </footer>
  );
};