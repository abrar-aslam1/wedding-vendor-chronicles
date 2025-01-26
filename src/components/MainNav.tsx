import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const renderAuthButtons = () => (
    user ? (
      <>
        <Button variant="outline" className="w-full md:w-auto border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white">
          List Your Business
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full md:w-auto text-wedding-text hover:text-wedding-primary"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </>
    ) : (
      <Button
        variant="ghost"
        onClick={() => navigate("/auth")}
        className="w-full md:w-auto text-wedding-text hover:text-wedding-primary"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/fc1186f3-9e97-4be6-910e-9851d1205033.png" 
              alt="My Wedding Logo" 
              className="h-12" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-wedding-text hover:text-wedding-primary"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Vendors
            </Button>
            {renderAuthButtons()}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-wedding-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="text-left text-wedding-text hover:text-wedding-primary"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Vendors
                  </Button>
                  <div className="flex flex-col gap-2 mt-4">
                    {renderAuthButtons()}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}