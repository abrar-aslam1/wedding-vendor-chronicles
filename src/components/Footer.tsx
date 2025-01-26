import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b4aeab64-b429-496c-820e-47b074f4f4d4.png" 
                alt="My Wedding Logo" 
                className="h-8"
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
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-wedding-text mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="text-sm text-wedding-text hover:text-wedding-primary cursor-pointer">
                Wedding Planners
              </li>
              <li className="text-sm text-wedding-text hover:text-wedding-primary cursor-pointer">
                Photographers
              </li>
              <li className="text-sm text-wedding-text hover:text-wedding-primary cursor-pointer">
                Venues
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-wedding-text mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-wedding-text">
                <Mail className="h-4 w-4 mr-2 text-wedding-primary" />
                contact@mywedding.com
              </li>
              <li className="flex items-center text-sm text-wedding-text">
                <Phone className="h-4 w-4 mr-2 text-wedding-primary" />
                (555) 123-4567
              </li>
              <li className="flex items-center text-sm text-wedding-text">
                <MapPin className="h-4 w-4 mr-2 text-wedding-primary" />
                123 Wedding Street
              </li>
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