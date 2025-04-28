import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, Search, Heart, LayoutDashboard, Calendar, Gift, Hash, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ListBusinessButton } from "@/components/ui/list-business-button";

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
        <Button
          variant="ghost"
          onClick={() => navigate("/favorites")}
          className="w-full md:w-auto text-wedding-text hover:text-wedding-primary"
        >
          <Heart className="h-4 w-4 mr-2" />
          My Favorites
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/portal")}
          className="w-full md:w-auto text-wedding-text hover:text-wedding-primary"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Wedding Portal
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
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
            <Button
              variant="ghost"
              onClick={() => navigate("/blog")}
              className="text-wedding-text hover:text-wedding-primary"
            >
              Blog
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-wedding-text hover:text-wedding-primary"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Free Tools
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate("/tools/wedding-timeline-generator")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Free Timeline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/tools/wedding-hashtag-generator")}>
                  <Hash className="h-4 w-4 mr-2" />
                  Hashtag Generator
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ListBusinessButton />
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
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/blog")}
                    className="text-left text-wedding-text hover:text-wedding-primary"
                  >
                    Blog
                  </Button>
                  <div className="space-y-1">
                    <div className="px-2 py-1.5">
                      <span className="text-sm font-semibold flex items-center">
                        <Gift className="h-4 w-4 mr-2" />
                        Free Tools
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/tools/wedding-timeline-generator")}
                      className="text-left text-wedding-text hover:text-wedding-primary pl-6"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Free Timeline Generator
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/tools/wedding-hashtag-generator")}
                      className="text-left text-wedding-text hover:text-wedding-primary pl-6"
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Wedding Hashtag Generator
                    </Button>
                  </div>
                  <ListBusinessButton />
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
