import { useWizard } from "../WizardContext";
import { VenueType, GuestCountRange } from "@/types/timeline";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Building2, 
  TreePine, 
  Church, 
  Utensils, 
  Home, 
  HelpCircle 
} from "lucide-react";

export const WeddingDetailsStep = () => {
  const { weddingDetails, updateWeddingDetail } = useWizard();
  
  const handleGuestCountChange = (value: string) => {
    const guestCountMap: Record<string, number> = {
      [GuestCountRange.Small]: 50,
      [GuestCountRange.Medium]: 100,
      [GuestCountRange.Large]: 200
    };
    
    updateWeddingDetail("guestCount", guestCountMap[value as GuestCountRange]);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-wedding-text">Tell us about your wedding</h2>
        <p className="text-gray-600 mt-1">
          These details help us customize your timeline with the right tasks and timing.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-wedding-text mb-3">How many guests are you expecting?</h3>
        <RadioGroup
          value={
            weddingDetails.guestCount 
              ? (weddingDetails.guestCount <= 50 
                ? GuestCountRange.Small 
                : weddingDetails.guestCount <= 150 
                  ? GuestCountRange.Medium 
                  : GuestCountRange.Large)
              : undefined
          }
          onValueChange={handleGuestCountChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem
              value={GuestCountRange.Small}
              id="guest-small"
              className="peer sr-only"
            />
            <Label
              htmlFor="guest-small"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Users className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Small</p>
                <p className="text-sm text-gray-500">0-50 guests</p>
              </div>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={GuestCountRange.Medium}
              id="guest-medium"
              className="peer sr-only"
            />
            <Label
              htmlFor="guest-medium"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Users className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Medium</p>
                <p className="text-sm text-gray-500">51-150 guests</p>
              </div>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={GuestCountRange.Large}
              id="guest-large"
              className="peer sr-only"
            />
            <Label
              htmlFor="guest-large"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Users className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Large</p>
                <p className="text-sm text-gray-500">151+ guests</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-wedding-text mb-3">What type of venue are you considering?</h3>
        <RadioGroup
          value={weddingDetails.venueType}
          onValueChange={(value) => updateWeddingDetail("venueType", value as VenueType)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem
              value={VenueType.Hotel}
              id="venue-hotel"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-hotel"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Building2 className="mb-3 h-6 w-6" />
              <p className="font-medium">Hotel/Resort</p>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={VenueType.Outdoor}
              id="venue-outdoor"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-outdoor"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <TreePine className="mb-3 h-6 w-6" />
              <p className="font-medium">Outdoor</p>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={VenueType.Religious}
              id="venue-religious"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-religious"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Church className="mb-3 h-6 w-6" />
              <p className="font-medium">Religious Venue</p>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={VenueType.Restaurant}
              id="venue-restaurant"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-restaurant"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Utensils className="mb-3 h-6 w-6" />
              <p className="font-medium">Restaurant</p>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={VenueType.PrivateEstate}
              id="venue-estate"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-estate"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <Home className="mb-3 h-6 w-6" />
              <p className="font-medium">Private Estate</p>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem
              value={VenueType.Other}
              id="venue-other"
              className="peer sr-only"
            />
            <Label
              htmlFor="venue-other"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-wedding-primary [&:has([data-state=checked])]:border-wedding-primary cursor-pointer"
            >
              <HelpCircle className="mb-3 h-6 w-6" />
              <p className="font-medium">Other</p>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Why this matters</h3>
        <p className="text-sm text-blue-700 mt-1">
          The size of your wedding and venue type affect your planning timeline. Larger weddings and certain venues require more lead time for booking and coordination.
        </p>
      </div>
    </div>
  );
};
