export interface TimelineEventType {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  created_at: string;
  is_generated?: boolean;
  template_id?: string;
  vendor_category?: string;
}

export interface WeddingDetails {
  weddingDate: string;
  guestCount: number;
  venueType: VenueType;
  selectedVendors: string[];
  specialRequirements?: string[];
}

export enum VenueType {
  Hotel = "hotel",
  Outdoor = "outdoor",
  Religious = "religious",
  Restaurant = "restaurant",
  PrivateEstate = "private_estate",
  Other = "other"
}

export enum GuestCountRange {
  Small = "small", // 0-50
  Medium = "medium", // 51-150
  Large = "large" // 151+
}

export interface TimelineTemplate {
  id: string;
  name: string;
  description: string;
  events: TimelineTemplateEvent[];
}

export interface TimelineTemplateEvent {
  title: string;
  description: string;
  timeframeDays: number; // Days before wedding
  vendor_category?: string;
  required: boolean;
}

// Default timeline templates based on wedding industry standards
export const defaultTimelineTemplates: TimelineTemplateEvent[] = [
  {
    title: "Book your venue",
    description: "Secure your ceremony and reception locations",
    timeframeDays: 365, // 12 months before
    vendor_category: "venues",
    required: true
  },
  {
    title: "Hire a wedding planner",
    description: "Find a professional to help coordinate your special day",
    timeframeDays: 365, // 12 months before
    vendor_category: "wedding-planners",
    required: false
  },
  {
    title: "Book your photographer",
    description: "Secure your preferred photographer before they're booked",
    timeframeDays: 365, // 12 months before
    vendor_category: "photographers",
    required: true
  },
  {
    title: "Book your caterer",
    description: "Arrange food and beverage service for your reception",
    timeframeDays: 300, // 10 months before
    vendor_category: "caterers",
    required: true
  },
  {
    title: "Book your DJ or band",
    description: "Secure entertainment for your reception",
    timeframeDays: 300, // 10 months before
    vendor_category: "djs-and-bands",
    required: true
  },
  {
    title: "Book your videographer",
    description: "Hire a professional to capture video of your special day",
    timeframeDays: 270, // 9 months before
    vendor_category: "videographers",
    required: false
  },
  {
    title: "Book your florist",
    description: "Arrange for flowers and decorations",
    timeframeDays: 240, // 8 months before
    vendor_category: "florists",
    required: true
  },
  {
    title: "Order your wedding dress",
    description: "Visit bridal shops and find your perfect dress",
    timeframeDays: 240, // 8 months before
    vendor_category: "bridal-shops",
    required: true
  },
  {
    title: "Order your wedding cake",
    description: "Select a cake designer and choose your cake style",
    timeframeDays: 180, // 6 months before
    vendor_category: "cake-designers",
    required: true
  },
  {
    title: "Book your hair stylist",
    description: "Schedule hair services for the wedding day",
    timeframeDays: 120, // 4 months before
    vendor_category: "hair-stylists",
    required: false
  },
  {
    title: "Book your makeup artist",
    description: "Schedule makeup services for the wedding day",
    timeframeDays: 120, // 4 months before
    vendor_category: "makeup-artists",
    required: false
  },
  {
    title: "Send save-the-dates",
    description: "Let your guests know when your wedding will be",
    timeframeDays: 240, // 8 months before
    required: true
  },
  {
    title: "Create wedding website",
    description: "Share details about your wedding with guests",
    timeframeDays: 210, // 7 months before
    required: false
  },
  {
    title: "Purchase wedding bands",
    description: "Shop for wedding rings for both of you",
    timeframeDays: 150, // 5 months before
    required: true
  },
  {
    title: "Send invitations",
    description: "Mail your wedding invitations to guests",
    timeframeDays: 90, // 3 months before
    required: true
  },
  {
    title: "Final venue walkthrough",
    description: "Review details with your venue coordinator",
    timeframeDays: 30, // 1 month before
    vendor_category: "venues",
    required: true
  },
  {
    title: "Final headcount to caterer",
    description: "Provide final guest count to your caterer",
    timeframeDays: 14, // 2 weeks before
    vendor_category: "caterers",
    required: true
  },
  {
    title: "Create seating chart",
    description: "Organize where guests will sit at the reception",
    timeframeDays: 14, // 2 weeks before
    required: true
  },
  {
    title: "Wedding rehearsal",
    description: "Practice the ceremony with your wedding party",
    timeframeDays: 1, // 1 day before
    required: true
  }
];
