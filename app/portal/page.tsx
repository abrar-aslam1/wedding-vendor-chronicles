'use client';

import { MainNav } from "@/components/MainNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Favorites from "@/pages_legacy/Favorites";
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Portal components
import PlanBoard from "@/components/portal/PlanBoard";
import WeddingTimeline from "@/components/portal/WeddingTimeline";

export default function UserPortal() {
  const [activeTab, setActiveTab] = useState("favorites");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        router.push('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access your wedding portal",
          variant: "destructive",
        });
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router, toast]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-wedding-primary mb-8">My Wedding Portal</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`w-full ${isMobile ? 'flex flex-col gap-2' : 'flex justify-between'} mb-8 ${isMobile ? 'bg-transparent' : 'bg-gray-100'}`}>
            <TabsTrigger 
              value="favorites" 
              className={`${isMobile ? 'w-full' : 'flex-1'} data-[state=active]:bg-wedding-primary data-[state=active]:text-white`}
            >
              My Favorites
            </TabsTrigger>
            <TabsTrigger 
              value="planboard" 
              className={`${isMobile ? 'w-full' : 'flex-1'} data-[state=active]:bg-wedding-primary data-[state=active]:text-white`}
            >
              Plan Board
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className={`${isMobile ? 'w-full' : 'flex-1'} data-[state=active]:bg-wedding-primary data-[state=active]:text-white`}
            >
              Wedding Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites">
            <Favorites />
          </TabsContent>
          
          <TabsContent value="planboard">
            <PlanBoard />
          </TabsContent>
          
          <TabsContent value="timeline">
            <WeddingTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
