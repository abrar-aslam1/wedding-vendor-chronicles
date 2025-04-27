import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, Info } from "lucide-react";
import { essentialCategories } from "@/types/planboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const EssentialVendorsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const essentialVendors = essentialCategories.filter(cat => cat.essential);
  const otherVendors = essentialCategories.filter(cat => !cat.essential);
  
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
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-wedding-text">{vendor.name}</h4>
                        <p className="text-sm text-gray-600">{vendor.description}</p>
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
                      <div className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-wedding-text">{vendor.name}</h4>
                        <p className="text-sm text-gray-600">{vendor.description}</p>
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
