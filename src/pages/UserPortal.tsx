import { MainNav } from "@/components/MainNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Favorites from "./Favorites";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// We'll implement these components next
import PlanBoard from "@/components/portal/PlanBoard";
import WeddingTimeline from "@/components/portal/WeddingTimeline";

const UserPortal = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access your wedding portal",
          variant: "destructive",
        });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-wedding-primary mb-8">My Wedding Portal</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-between mb-8 bg-gray-100">
            <TabsTrigger 
              value="favorites" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              My Favorites
            </TabsTrigger>
            <TabsTrigger 
              value="planboard" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              Plan Board
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
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
};

export default () => (
  <ProtectedRoute>
    <UserPortal />
  </ProtectedRoute>
);
