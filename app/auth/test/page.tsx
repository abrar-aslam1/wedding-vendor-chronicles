'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/_lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/MainNav";
import { useToast } from "@/hooks/use-toast";

export default function TestAuth() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Hello123!");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Redirecting to portal...",
      });
      
      router.push("/portal");
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

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 pt-24 flex justify-center">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-wedding-primary mb-6">Test Authentication</h1>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-wedding-primary hover:bg-wedding-primary/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-sm text-gray-600 mt-4">
              <p>Use the pre-filled credentials to test the authentication flow.</p>
              <p className="mt-2">After signing in, you'll be redirected to the user portal.</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
