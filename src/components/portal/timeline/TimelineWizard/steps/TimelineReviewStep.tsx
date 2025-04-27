import { useState } from "react";
import { useWizard } from "../WizardContext";
import { TimelineEventType } from "@/types/timeline";
import { format, parseISO } from "date-fns";
import { Calendar, Check, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { essentialCategories } from "@/types/planboard";

interface TimelineReviewStepProps {
  events: Partial<TimelineEventType>[];
}

export const TimelineReviewStep = ({ events }: TimelineReviewStepProps) => {
  const { weddingDetails } = useWizard();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>(
    events.reduce((acc, event) => {
      // Default all events to selected
      acc[event.title || ""] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  
  // Group events by month
  const eventsByMonth: Record<string, Partial<TimelineEventType>[]> = {};
  
  events.forEach(event => {
    if (!event.date) return;
    
    const monthYear = format(parseISO(event.date), "MMMM yyyy");
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = [];
    }
    eventsByMonth[monthYear].push(event);
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(eventsByMonth).sort((a, b) => {
    return parseISO(eventsByMonth[a][0].date!).getTime() - parseISO(eventsByMonth[b][0].date!).getTime();
  });
  
  const handleToggleEvent = (title: string) => {
    setSelectedEvents(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  
  const handleSelectAll = (monthYear: string, selected: boolean) => {
    const newSelectedEvents = { ...selectedEvents };
    
    eventsByMonth[monthYear].forEach(event => {
      if (event.title) {
        newSelectedEvents[event.title] = selected;
      }
    });
    
    setSelectedEvents(newSelectedEvents);
  };
  
  const filteredMonths = sortedMonths.filter(monthYear => {
    if (!searchTerm) return true;
    
    return eventsByMonth[monthYear].some(event => 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getVendorName = (vendorSlug?: string) => {
    if (!vendorSlug) return null;
    const vendor = essentialCategories.find(v => v.slug === vendorSlug);
    return vendor ? vendor.name : null;
  };
  
  const selectedEventCount = Object.values(selectedEvents).filter(Boolean).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-wedding-text">Review Your Timeline</h2>
        <p className="text-gray-600 mt-1">
          We've created a personalized timeline based on your wedding details. Review and customize it before adding to your timeline.
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search events..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          {selectedEventCount} of {events.length} events selected
        </div>
      </div>
      
      <div className="border rounded-md divide-y">
        {filteredMonths.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No events match your search
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filteredMonths.map(monthYear => {
              const monthEvents = eventsByMonth[monthYear];
              const allSelected = monthEvents.every(event => event.title && selectedEvents[event.title]);
              const someSelected = monthEvents.some(event => event.title && selectedEvents[event.title]);
              
              return (
                <AccordionItem value={monthYear} key={monthYear}>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(checked) => handleSelectAll(monthYear, checked === true)}
                          onClick={(e) => e.stopPropagation()}
                          className="mr-3"
                        />
                        <span className="font-medium">{monthYear}</span>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-gray-100">
                        {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0">
                    <div className="divide-y">
                      {monthEvents.map((event, index) => {
                        const isSelected = event.title ? selectedEvents[event.title] : false;
                        const vendorName = getVendorName(event.vendor_category);
                        
                        return (
                          <div 
                            key={index}
                            className={`flex items-start p-4 ${
                              isSelected ? 'bg-white' : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => event.title && handleToggleEvent(event.title)}
                              className="mt-1 mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h4 className={`font-medium ${isSelected ? 'text-wedding-text' : 'text-gray-500'}`}>
                                  {event.title}
                                </h4>
                                <div className="flex items-center mt-1 sm:mt-0">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {event.date && format(parseISO(event.date), "MMMM d, yyyy")}
                                  </span>
                                </div>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm mt-1 text-gray-600">
                                  {event.description}
                                </p>
                              )}
                              
                              {vendorName && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {vendorName}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
        <p className="text-sm text-blue-700 mt-1">
          When you click "Add to Timeline", the selected events will be added to your wedding timeline. You can always edit, add, or remove events later.
        </p>
      </div>
    </div>
  );
};
