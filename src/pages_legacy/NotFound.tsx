import { Link } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-wedding-text mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/" className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;