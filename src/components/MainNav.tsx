import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to search for vendors",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/search/${category.toLowerCase().replace(/\s+&?\s+/g, "-")}`);
  };

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
          
          <div className="hidden md:flex items-center space-x-4">
            {categories.slice(0, 5).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="text-wedding-text hover:text-wedding-primary transition-colors"
              >
                {category}
              </button>
            ))}
            {user ? (
              <>
                <Button variant="outline" className="border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white">
                  List Your Business
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-wedding-text hover:text-wedding-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="text-wedding-text hover:text-wedding-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}