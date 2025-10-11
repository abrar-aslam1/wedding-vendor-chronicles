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
    <nav className="liquid-glass-nav fixed top-0 left-0 right-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center touch-manipulation">
            <img 
              src="/lovable-uploads/fc1186f3-9e97-4be6-910e-9851d1205033.png" 
              alt="My Wedding Logo" 
              className="h-10 sm:h-12" 
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
              onClick={() => navigate("/states")}
              className="text-wedding-text hover:text-wedding-primary"
            >
              Browse by State
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
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Avatar className="h-8 w-8 touch-manipulation">
                <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-wedding-primary touch-manipulation min-h-[44px] min-w-[44px]"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 min-h-[48px] touch-manipulation"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    Search Vendors
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/states")}
                    className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 min-h-[48px] touch-manipulation"
                  >
                    Browse by State
                  </Button>
                  <div className="space-y-1 mt-4">
                    <div className="px-3 py-2">
                      <span className="text-sm font-semibold flex items-center text-wedding-primary">
                        <Gift className="h-4 w-4 mr-2" />
                        Free Tools
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/tools/wedding-timeline-generator")}
                      className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 pl-6 min-h-[48px] touch-manipulation"
                    >
                      <Calendar className="h-5 w-5 mr-3" />
                      Timeline Generator
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/tools/wedding-hashtag-generator")}
                      className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 pl-6 min-h-[48px] touch-manipulation"
                    >
                      <Hash className="h-5 w-5 mr-3" />
                      Hashtag Generator
                    </Button>
                  </div>
                  <div className="mt-6">
                    <ListBusinessButton />
                  </div>
                  <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200">
                    {user ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/favorites")}
                          className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 min-h-[48px] touch-manipulation"
                        >
                          <Heart className="h-5 w-5 mr-3" />
                          My Favorites
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/portal")}
                          className="justify-start text-wedding-text hover:text-wedding-primary hover:bg-wedding-light/50 min-h-[48px] touch-manipulation"
                        >
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          Wedding Portal
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[48px] touch-manipulation"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/auth")}
                        className="justify-start text-wedding-primary hover:text-wedding-primary/80 hover:bg-wedding-light/50 min-h-[48px] touch-manipulation"
                      >
                        <LogIn className="h-5 w-5 mr-3" />
                        Sign In
                      </Button>
                    )}
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
