import { useState, useEffect } from "react";
import { useWizard } from "../WizardContext";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addMonths } from "date-fns";

export const WeddingDateStep = () => {
  const { weddingDetails, updateWeddingDetail } = useWizard();
  const [date, setDate] = useState<Date | undefined>(
    weddingDetails.weddingDate ? new Date(weddingDetails.weddingDate) : undefined
  );
  
  // Set minimum date to today and maximum date to 2 years from now
  const today = new Date();
  const maxDate = addMonths(today, 24);
  
  useEffect(() => {
    if (date) {
      updateWeddingDetail("weddingDate", format(date, "yyyy-MM-dd"));
    }
  }, [date, updateWeddingDetail]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-wedding-text">When is your wedding?</h2>
        <p className="text-gray-600 mt-1">
          Select your wedding date to help us create a personalized timeline.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center py-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM d, yyyy") : <span>Select your wedding date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              fromDate={today}
              toDate={maxDate}
            />
          </PopoverContent>
        </Popover>
        
        {date && (
          <div className="mt-8 text-center">
            <div className="text-lg font-medium text-wedding-primary">
              {format(date, "MMMM d, yyyy")}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Why this matters</h3>
        <p className="text-sm text-blue-700 mt-1">
          Your wedding date is the anchor point for your planning timeline. We'll work backward from this date to create a customized schedule of when to book vendors and complete important tasks.
        </p>
      </div>
    </div>
  );
};
