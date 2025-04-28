import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TimelineWizard } from "@/components/portal/timeline/TimelineWizard";
import { TimelineEventType } from "@/types/timeline";
import { format, parseISO } from "date-fns";
import { Calendar, Download, Printer, Share2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import TimelineBreadcrumbs from "@/components/timeline/TimelineBreadcrumbs";
import TimelineSchemaMarkup from "@/components/timeline/TimelineSchemaMarkup";
import TimelineFAQ from "@/components/timeline/TimelineFAQ";
import LocationContent from "@/components/timeline/LocationContent";

const FreeTimelineGenerator = () => {
  // Get state and city from URL params
  const { state: stateSlug, city: citySlug } = useParams<{ state?: string; city?: string }>();
  
  const [generatedEvents, setGeneratedEvents] = useState<Partial<TimelineEventType>[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Determine if we're on a location-specific page
  const isLocationPage = Boolean(stateSlug);
  
  // Generate canonical URL
  const canonicalUrl = stateSlug && citySlug
    ? `${window.location.origin}/tools/wedding-timeline-generator/states/${stateSlug}/${citySlug}`
    : stateSlug
      ? `${window.location.origin}/tools/wedding-timeline-generator/states/${stateSlug}`
      : `${window.location.origin}/tools/wedding-timeline-generator`;

  const handleAddEvents = (events: Partial<TimelineEventType>[]) => {
    // Filter out events that the user deselected in the wizard
    const eventsToAdd = events.filter(event => event.title);
    
    if (eventsToAdd.length === 0) {
      toast({
        title: "No events to add",
        description: "Please select at least one event to add to your timeline.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratedEvents(eventsToAdd);
    setShowResults(true);
    
    toast({
      title: "Timeline generated",
      description: `Generated ${eventsToAdd.length} events for your timeline.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    let csvContent = "Date,Title,Description\n";
    
    generatedEvents.forEach(event => {
      if (!event.date || !event.title) return;
      
      const date = format(parseISO(event.date), "yyyy-MM-dd");
      const title = event.title.replace(/,/g, " ");
      const description = event.description ? event.description.replace(/,/g, " ") : "";
      
      csvContent += `${date},${title},${description}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "wedding-timeline.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group events by month for display
  const eventsByMonth: Record<string, Partial<TimelineEventType>[]> = {};
  
  generatedEvents.forEach(event => {
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

  // Render the timeline results
  const renderTimelineResults = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-semibold text-wedding-text">Your Wedding Timeline</h2>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setShowResults(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wizard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="print:text-black">
          <h2 className="text-2xl font-bold text-center mb-6 print:text-black">Wedding Planning Timeline</h2>
          
          {generatedEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-wedding-primary/50" />
              <p className="text-lg">No events found</p>
              <p className="text-sm">Go back to the wizard to generate your timeline</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 print:bg-gray-400"></div>
              
              <div className="space-y-8">
                {sortedMonths.map(monthYear => (
                  <div key={monthYear} className="ml-8 relative">
                    <div className="absolute -left-8 top-3 w-4 h-4 rounded-full bg-wedding-primary print:bg-black"></div>
                    <h3 className="text-xl font-semibold mb-4 print:text-black">{monthYear}</h3>
                    
                    <div className="space-y-4">
                      {eventsByMonth[monthYear].map((event, index) => (
                        <div key={index} className="border rounded-md p-4 print:border-gray-400">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h4 className="font-medium text-lg print:text-black">{event.title}</h4>
                            <div className="flex items-center mt-1 md:mt-0">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 print:text-gray-600" />
                              <span className="text-sm text-gray-500 print:text-gray-600">
                                {event.date && format(parseISO(event.date), "MMMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm mt-2 text-gray-600 print:text-gray-700">
                              {event.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg print:hidden">
        <h3 className="text-lg font-medium text-blue-800 mb-2">What's next?</h3>
        <p className="text-blue-700 mb-4">
          Now that you have your wedding timeline, you can:
        </p>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>Print or download your timeline to keep track of important dates</li>
          <li>Share it with your partner, family, or wedding planner</li>
          <li>
            <Link to="/signup" className="text-blue-600 underline hover:text-blue-800">
              Create an account
            </Link>
            {" "}to save your timeline and access more wedding planning tools
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* SEO Components */}
      <SEOHead 
        isHomePage={false}
        canonicalUrl={canonicalUrl}
        imageUrl="/Screenshot 2025-04-20 at 9.59.36 PM.png"
      />
      
      <TimelineSchemaMarkup 
        stateSlug={stateSlug}
        citySlug={citySlug}
        canonicalUrl={canonicalUrl}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <TimelineBreadcrumbs 
          stateSlug={stateSlug}
          citySlug={citySlug}
          className="mb-6"
        />
        
        {/* Location-specific content or regular content */}
        {isLocationPage ? (
          <>
            <LocationContent 
              stateSlug={stateSlug}
              citySlug={citySlug}
            />
            
            {/* Generator Tool - shown on all pages */}
            <div className="mt-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Generate Your {citySlug ? `${citySlug.replace(/-/g, ' ')}` : stateSlug ? `${stateSlug.replace(/-/g, ' ')}` : ''} Wedding Timeline</h2>
              
              {!showResults ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <TimelineWizard 
                    onClose={() => {}} // Not used in this context
                    onAddEvents={handleAddEvents}
                    requireAuth={false}
                  />
                </div>
              ) : (
                renderTimelineResults()
              )}
            </div>
            
            <TimelineFAQ 
              stateSlug={stateSlug}
              citySlug={citySlug}
              className="mt-12"
            />
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-wedding-primary">Free Wedding Timeline Generator</h1>
                <p className="text-gray-600 mt-2">
                  Create a personalized wedding planning timeline in minutes - no sign up required!
                </p>
              </div>
              
              {!showResults && (
                <Link to="/">
                  <Button variant="outline" className="mt-4 md:mt-0">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              )}
            </div>

            {!showResults ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <TimelineWizard 
                  onClose={() => {}} // Not used in this context
                  onAddEvents={handleAddEvents}
                  requireAuth={false}
                />
              </div>
            ) : (
              renderTimelineResults()
            )}
            
            {/* Add FAQ to non-location pages too */}
            <TimelineFAQ className="mt-12" />
          </>
        )}
      </div>
    </div>
  );
};

export default FreeTimelineGenerator;
