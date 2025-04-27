import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, Info, Check } from "lucide-react";
import { essentialCategories, VendorCompletion } from "@/types/planboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EssentialVendorsGuideProps {
  isDemo?: boolean;
}

export const EssentialVendorsGuide = ({ isDemo = false }: EssentialVendorsGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const essentialVendors = essentialCategories.filter(cat => cat.essential);
  const otherVendors = essentialCategories.filter(cat => !cat.essential);
  
  useEffect(() => {
    if (!isDemo) {
      fetchCompletions();
    }
  }, [isDemo]);
  
  const fetchCompletions = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data, error } = await supabase
        .from('vendor_completions')
        .select('vendor_slug, completed')
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      const completionsMap: Record<string, boolean> = {};
      data?.forEach(item => {
        completionsMap[item.vendor_slug] = item.completed;
      });
      
      setCompletions(completionsMap);
    } catch (error: any) {
      console.error('Error fetching vendor completions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckboxChange = async (vendorSlug: string, checked: boolean) => {
    if (isDemo) {
      // For demo mode, just update the local state
      setCompletions(prev => ({
        ...prev,
        [vendorSlug]: checked
      }));
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to track your vendor completions",
          variant: "destructive",
        });
        return;
      }
      
      // Optimistically update UI
      setCompletions(prev => ({
        ...prev,
        [vendorSlug]: checked
      }));
      
      const { data, error } = await supabase
        .from('vendor_completions')
        .upsert({
          user_id: session.user.id,
          vendor_slug: vendorSlug,
          completed: checked,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,vendor_slug'
        })
        .select()
        .single();
        
      if (error) throw error;
      
    } catch (error: any) {
      // Revert optimistic update on error
      setCompletions(prev => ({
        ...prev,
        [vendorSlug]: !checked
      }));
      
      toast({
        title: "Error updating vendor status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="p-4 mb-6 bg-white shadow-sm">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-wedding-primary" />
          <h3 className="font-semibold text-lg text-wedding-text">Wedding Essentials Guide</h3>
        </div>
        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>
      
      {isOpen && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Planning a wedding involves many vendors. Here's a guide to help you prioritize which vendors to book first and which are essential for most weddings.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="essential">
              <AccordionTrigger className="text-wedding-primary font-medium">
                Essential Vendors
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {essentialVendors.map(vendor => (
                    <div key={vendor.slug} className="flex items-start gap-2">
                      <div className="flex items-center mt-1">
                        <Checkbox 
                          id={`vendor-${vendor.slug}`}
                          checked={completions[vendor.slug] || false}
                          onCheckedChange={(checked) => handleCheckboxChange(vendor.slug, checked === true)}
                          className="mr-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label 
                            htmlFor={`vendor-${vendor.slug}`}
                            className={`font-medium cursor-pointer ${completions[vendor.slug] ? 'line-through text-gray-500' : 'text-wedding-text'}`}
                          >
                            {vendor.name}
                          </label>
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                            Essential
                          </Badge>
                        </div>
                        <p className={`text-sm ${completions[vendor.slug] ? 'text-gray-400' : 'text-gray-600'}`}>
                          {vendor.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="other">
              <AccordionTrigger className="text-gray-600 font-medium">
                Other Vendors to Consider
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {otherVendors.map(vendor => (
                    <div key={vendor.slug} className="flex items-start gap-2">
                      <div className="flex items-center mt-1">
                        <Checkbox 
                          id={`vendor-${vendor.slug}`}
                          checked={completions[vendor.slug] || false}
                          onCheckedChange={(checked) => handleCheckboxChange(vendor.slug, checked === true)}
                          className="mr-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label 
                            htmlFor={`vendor-${vendor.slug}`}
                            className={`font-medium cursor-pointer ${completions[vendor.slug] ? 'line-through text-gray-500' : 'text-wedding-text'}`}
                          >
                            {vendor.name}
                          </label>
                        </div>
                        <p className={`text-sm ${completions[vendor.slug] ? 'text-gray-400' : 'text-gray-600'}`}>
                          {vendor.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="timeline">
              <AccordionTrigger className="text-wedding-primary font-medium">
                Booking Timeline
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="font-medium text-wedding-text">12+ Months Before</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2 mt-1">
                      <li>Venue</li>
                      <li>Wedding Planner</li>
                      <li>Photographer</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-wedding-text">9-12 Months Before</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2 mt-1">
                      <li>Caterer</li>
                      <li>DJ or Band</li>
                      <li>Videographer</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-wedding-text">6-9 Months Before</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2 mt-1">
                      <li>Florist</li>
                      <li>Cake Designer</li>
                      <li>Bridal Shop (for dress)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-wedding-text">3-6 Months Before</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2 mt-1">
                      <li>Hair Stylist</li>
                      <li>Makeup Artist</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Card>
  );
};
