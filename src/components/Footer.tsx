import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg text-wedding-text mb-4">About Us</h3>
            <p className="text-sm text-gray-600">
              We help couples find the perfect wedding vendors for their special day. Our platform
              connects you with top professionals in your area.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-wedding-text mb-4">Quick Links</h3>
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
            <h3 className="font-semibold text-lg text-wedding-text mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search/wedding-photographers" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Wedding Photographers
                </Link>
              </li>
              <li>
                <Link to="/search/wedding-venues" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Wedding Venues
                </Link>
              </li>
              <li>
                <Link to="/search/wedding-planners" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Wedding Planners
                </Link>
              </li>
              <li>
                <Link to="/search/wedding-florists" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Wedding Florists
                </Link>
              </li>
              <li>
                <Link to="/search/wedding-dj" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Wedding DJs
                </Link>
              </li>
              <li>
                <Link to="/search/wedding-makeup-artists" className="text-sm text-wedding-text hover:text-wedding-primary">
                  Makeup Artists
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Wedding Vendor Directory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};