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
          // Check if this is a vendor sign-in
          const isVendor = searchParams.get("type") === "vendor";
          
          // If this is a vendor OAuth sign-up, update user metadata
          if (isVendor && !session.user.user_metadata?.user_type) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: { user_type: 'vendor' }
            });
            
            if (updateError) {
              console.error('Failed to update user metadata:', updateError);
            }
          }
          
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

          // Get return URL
          const returnUrl = searchParams.get("returnUrl");
          
          // Determine user type from metadata or URL parameter
          const userType = session.user.user_metadata?.user_type || (isVendor ? 'vendor' : 'couple');
          
          // Redirect based on user type
          if (userType === 'vendor' || isVendor) {
            // For vendors, go to vendor dashboard or custom return URL
            const vendorReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : "/vendor-dashboard";
            toast({
              title: "Welcome!",
              description: "Successfully signed in to your vendor account.",
            });
            navigate(vendorReturnUrl);
          } else {
            // For couples, go to home or custom return URL
            navigate(returnUrl ? decodeURIComponent(returnUrl) : "/");
          }
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
  }, [navigate, searchParams, toast]);

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
