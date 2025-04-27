import { useWizard } from "../WizardContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { essentialCategories } from "@/types/planboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";

export const VendorSelectionStep = () => {
  const { weddingDetails, updateWeddingDetail } = useWizard();
  const { selectedVendors = [] } = weddingDetails;
  
  const handleVendorToggle = (vendorSlug: string, checked: boolean) => {
    const updatedVendors = checked
      ? [...selectedVendors, vendorSlug]
      : selectedVendors.filter(v => v !== vendorSlug);
    
    updateWeddingDetail("selectedVendors", updatedVendors);
  };
  
  // Group vendors by essential and non-essential
  const essentialVendors = essentialCategories.filter(v => v.essential);
  const otherVendors = essentialCategories.filter(v => !v.essential);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-wedding-text">Select your vendors</h2>
        <p className="text-gray-600 mt-1">
          Choose which vendors you'll need for your wedding. This helps us create a customized timeline.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-wedding-text mb-3 flex items-center">
          Essential Vendors
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 ml-2 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-sm">These vendors are typically booked first and are considered essential for most weddings.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {essentialVendors.map((vendor) => (
            <div key={vendor.slug} className="flex items-start space-x-3 p-3 rounded-md border">
              <Checkbox
                id={`vendor-${vendor.slug}`}
                checked={selectedVendors.includes(vendor.slug)}
                onCheckedChange={(checked) => 
                  handleVendorToggle(vendor.slug, checked === true)
                }
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <Label
                    htmlFor={`vendor-${vendor.slug}`}
                    className="font-medium cursor-pointer"
                  >
                    {vendor.name}
                  </Label>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                    Essential
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-wedding-text mb-3">Additional Vendors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {otherVendors.map((vendor) => (
            <div key={vendor.slug} className="flex items-start space-x-3 p-3 rounded-md border">
              <Checkbox
                id={`vendor-${vendor.slug}`}
                checked={selectedVendors.includes(vendor.slug)}
                onCheckedChange={(checked) => 
                  handleVendorToggle(vendor.slug, checked === true)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor={`vendor-${vendor.slug}`}
                  className="font-medium cursor-pointer"
                >
                  {vendor.name}
                </Label>
                <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Why this matters</h3>
        <p className="text-sm text-blue-700 mt-1">
          Different vendors need to be booked at different times in your planning process. By selecting the vendors you need, we can create a timeline that ensures you book each vendor at the optimal time.
        </p>
      </div>
    </div>
  );
};
