import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Check your email for the confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
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
          redirectTo: `${window.location.origin}/auth/callback`
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-wedding-secondary to-wedding-light flex flex-col items-center justify-center p-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-wedding-text hover:text-wedding-primary"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-wedding-primary/20">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-wedding-primary">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600 font-body">Sign in or create an account to continue</p>
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

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/90 border-2 border-gray-200 focus:border-wedding-primary"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/90 border-2 border-gray-200 focus:border-wedding-primary"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-wedding-primary hover:bg-wedding-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              variant="outline"
              className="w-full border-2 border-wedding-primary text-wedding-primary hover:bg-wedding-primary hover:text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;