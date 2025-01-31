import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw profileError;
          }

          // Create profile if it doesn't exist
          if (!profile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: session.user.id });

            if (insertError) throw insertError;
          }

          const returnUrl = searchParams.get("returnUrl");
          navigate(returnUrl ? decodeURIComponent(returnUrl) : "/");
        } else {
          navigate("/auth");
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to complete authentication",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-wedding-text mb-4">
          Verifying your authentication...
        </h1>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
