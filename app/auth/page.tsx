'use client';

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAuthForm } from "@/components/auth/UserAuthForm";
import { VendorAuthForm } from "@/components/auth/VendorAuthForm";
import { useNavigateCompat } from "@/../lib/migration-helpers";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigateCompat();
  const searchParams = useSearchParams();
  
  // Get the tab from URL parameters, default to "couples"
  const defaultTab = searchParams?.get("tab") === "vendors" ? "vendors" : "couples";

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
          <h2 className="text-3xl font-heading font-bold text-wedding-primary">Welcome</h2>
          <p className="mt-2 text-sm text-gray-600 font-body">Choose your account type to continue</p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="couples" 
              className="text-sm font-medium data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              For Couples
            </TabsTrigger>
            <TabsTrigger 
              value="vendors"
              className="text-sm font-medium data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              For Vendors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="couples" className="space-y-6 mt-6">
            <UserAuthForm loading={loading} setLoading={setLoading} />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6 mt-6">
            <VendorAuthForm loading={loading} setLoading={setLoading} />
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/terms")}
              className="text-xs text-wedding-primary hover:text-wedding-primary/80 p-0 h-auto"
            >
              Terms of Service
            </Button>
            {" "}and{" "}
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/privacy")}
              className="text-xs text-wedding-primary hover:text-wedding-primary/80 p-0 h-auto"
            >
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
