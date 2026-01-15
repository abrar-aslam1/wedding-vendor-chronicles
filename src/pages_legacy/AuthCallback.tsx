import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import posthog from "posthog-js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        let session = null;

        // If we have tokens in the hash, set the session explicitly
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          session = data.session;
        } else {
          // Fallback: try to get session normally
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          session = existingSession;
        }
        
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

          // Identify user in PostHog after OAuth callback
          posthog.identify(session.user.id, {
            email: session.user.email,
            user_type: userType,
            email_verified: session.user.email_confirmed_at !== null,
            oauth_provider: 'google',
          });

          // Track OAuth completion
          posthog.capture('oauth_callback_completed', {
            provider: 'google',
            user_type: userType,
            is_new_profile: !profile,
          });

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
        setError(error.message || "Failed to complete authentication");
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to complete authentication",
          variant: "destructive",
        });
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Verifying your authentication...
        </h1>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
