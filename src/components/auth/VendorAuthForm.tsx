import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Store, Eye, EyeOff } from "lucide-react";

interface VendorAuthFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const VendorAuthForm = ({ loading, setLoading }: VendorAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const returnUrl = searchParams.get("returnUrl");

  const handleVendorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isSignUp) {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: 'vendor'
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });
        setIsSignUp(false);
      } else {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user is a vendor
        const userType = data.user?.user_metadata?.user_type;
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your vendor account.",
        });

        // Navigate to vendor dashboard or return URL
        navigate(returnUrl ? decodeURIComponent(returnUrl) : "/vendor-dashboard");
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Registration Failed" : "Sign In Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl || "/vendor-dashboard")}&type=vendor`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=vendor`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Store className="w-6 h-6 text-wedding-primary" />
          <h3 className="text-xl font-semibold text-wedding-primary">For Vendors</h3>
        </div>
        <p className="text-sm text-gray-600">
          {isSignUp ? "Join our vendor network" : "Access your business dashboard"}
        </p>
      </div>

      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200"
      >
        <img src="/lovable-uploads/3bd6330f-efab-4a54-89b3-56ae29a9e4b5.png" alt="Google" className="w-5 h-5" />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleVendorAuth} className="space-y-4">
        <Input
          type="email"
          placeholder="Business email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/90 border-2 border-gray-200 focus:border-wedding-primary"
          required
        />
        
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/90 border-2 border-gray-200 focus:border-wedding-primary pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-wedding-primary hover:bg-wedding-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Vendor Account" : "Sign In")}
          </Button>
          
          {!isSignUp && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-wedding-primary"
            >
              Forgot your password?
            </Button>
          )}
        </div>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-wedding-primary hover:text-wedding-primary/80"
        >
          {isSignUp ? "Already have an account? Sign in" : "New vendor? Create an account"}
        </Button>
      </div>

      {isSignUp && (
        <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
          <p className="mb-2">
            <strong>New to our platform?</strong> Create your vendor account to:
          </p>
          <ul className="text-left space-y-1">
            <li>• Manage your business profile</li>
            <li>• Track customer inquiries</li>
            <li>• View analytics and insights</li>
            <li>• Access premium features</li>
          </ul>
        </div>
      )}
    </div>
  );
};
