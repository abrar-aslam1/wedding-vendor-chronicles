import { WeddingDetails, TimelineEventType, defaultTimelineTemplates } from "@/types/timeline";
import { addDays, format, parseISO, subDays } from "date-fns";

/**
 * Generates a timeline of events based on wedding details
 */
export const generateTimeline = (weddingDetails: Partial<WeddingDetails>): Partial<TimelineEventType>[] => {
  if (!weddingDetails.weddingDate) {
    return [];
  }
  
  const weddingDate = parseISO(weddingDetails.weddingDate);
  const events: Partial<TimelineEventType>[] = [];
  
  // Add wedding day as the first event
  events.push({
    title: "Wedding Day",
    description: "Your special day has arrived!",
    date: weddingDetails.weddingDate,
    completed: false,
    is_generated: true,
    template_id: "wedding-day"
  });
  
  // Filter templates based on selected vendors
  const selectedVendors = weddingDetails.selectedVendors || [];
  const filteredTemplates = defaultTimelineTemplates.filter(template => {
    // Include if it's required or if it's vendor-specific and that vendor is selected
    return template.required || 
           (template.vendor_category && selectedVendors.includes(template.vendor_category));
  });
  
  // Generate events from templates
  filteredTemplates.forEach(template => {
    // Calculate the date for this event based on the wedding date and timeframe
    const eventDate = subDays(weddingDate, template.timeframeDays);
    
    // Create the event
    events.push({
      title: template.title,
      description: template.description,
      date: format(eventDate, "yyyy-MM-dd"),
      completed: false,
      is_generated: true,
      template_id: template.title.toLowerCase().replace(/\s+/g, '-'),
      vendor_category: template.vendor_category
    });
  });
  
  // Add venue-specific events if venue is selected
  if (selectedVendors.includes("venues")) {
    // Adjust timing based on venue type
    const venueType = weddingDetails.venueType;
    let venueVisitTimeframe = 180; // Default 6 months before
    
    if (venueType === "hotel" || venueType === "restaurant") {
      venueVisitTimeframe = 150; // 5 months before for hotels/restaurants
    } else if (venueType === "outdoor" || venueType === "private_estate") {
      venueVisitTimeframe = 210; // 7 months before for outdoor/private venues
    }
    
    events.push({
      title: "Schedule venue visits",
      description: "Visit potential venues to find the perfect location",
      date: format(subDays(weddingDate, venueVisitTimeframe), "yyyy-MM-dd"),
      completed: false,
      is_generated: true,
      template_id: "venue-visits",
      vendor_category: "venues"
    });
  }
  
  // Add guest count specific events
  if (weddingDetails.guestCount) {
    const guestCount = weddingDetails.guestCount;
    
    if (guestCount > 100) {
      // For larger weddings, add hotel block booking
      events.push({
        title: "Book hotel room blocks",
        description: "Reserve hotel rooms for out-of-town guests",
        date: format(subDays(weddingDate, 240), "yyyy-MM-dd"),
        completed: false,
        is_generated: true,
        template_id: "hotel-blocks"
      });
      
      // Add transportation planning for larger weddings
      events.push({
        title: "Arrange guest transportation",
        description: "Book shuttles or transportation for guests",
        date: format(subDays(weddingDate, 120), "yyyy-MM-dd"),
        completed: false,
        is_generated: true,
        template_id: "guest-transportation"
      });
    }
    
    // Adjust save-the-date timing based on guest count
    const saveTheDateEvent = events.find(e => e.title === "Send save-the-dates");
    if (saveTheDateEvent && guestCount > 150) {
      // For very large weddings, send save-the-dates earlier
      saveTheDateEvent.date = format(subDays(weddingDate, 270), "yyyy-MM-dd");
    }
  }
  
  // Sort events by date
  events.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });
  
  return events;
};
