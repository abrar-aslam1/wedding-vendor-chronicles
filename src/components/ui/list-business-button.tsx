import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ListBusinessButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to list your business",
        variant: "default",
      });
      navigate("/auth?returnUrl=/list-business");
      return;
    }

    navigate("/list-business");
  };
  
  return (
    <button
      onClick={handleClick}
      className="group relative inline-block w-full md:w-auto cursor-pointer outline-none border-0 bg-gradient-to-r from-wedding-primary to-wedding-accent hover:from-wedding-accent hover:to-wedding-primary p-0 text-base font-inherit mx-1 md:mx-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <span className="relative block py-2.5 px-6 md:px-8 text-center font-semibold text-white transition-all duration-300 ease-out">
        <span className="hidden md:inline">List Your Business</span>
        <span className="md:hidden">List Business</span>
      </span>
    </button>
  );
};
