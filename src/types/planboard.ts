export interface PlanBoardColumn {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface PlanBoardItem {
  id: string;
  user_id: string;
  column_id: string;
  vendor_id?: string;
  vendor_data?: any;
  title: string;
  description?: string;
  budget?: number;
  notes?: string;
  category?: string;
  position: number;
  created_at: string;
}

export type VendorCategory = {
  name: string;
  slug: string;
  description: string;
  essential: boolean;
};

export interface VendorCompletion {
  userId: string;
  vendorSlug: string;
  completed: boolean;
  notes?: string;
  updatedAt: string;
}

export const essentialCategories: VendorCategory[] = [
  {
    name: "Venues",
    slug: "venues",
    description: "Perfect locations for your ceremony and reception",
    essential: true
  },
  {
    name: "Photographers",
    slug: "photographers",
    description: "Capture every magical moment",
    essential: true
  },
  {
    name: "Caterers",
    slug: "caterers",
    description: "Delicious cuisine for your reception",
    essential: true
  },
  {
    name: "Wedding Planners",
    slug: "wedding-planners",
    description: "Professional planners to orchestrate your perfect day",
    essential: true
  },
  {
    name: "Florists",
    slug: "florists",
    description: "Beautiful floral arrangements for your special day",
    essential: true
  },
  {
    name: "DJs & Bands",
    slug: "djs-and-bands",
    description: "Entertainment to keep the party going",
    essential: true
  },
  {
    name: "Cake Designers",
    slug: "cake-designers",
    description: "Beautiful and delicious wedding cakes",
    essential: true
  },
  {
    name: "Bridal Shops",
    slug: "bridal-shops",
    description: "Find your perfect wedding dress",
    essential: true
  },
  {
    name: "Videographers",
    slug: "videographers",
    description: "Create lasting memories in motion",
    essential: false
  },
  {
    name: "Makeup Artists",
    slug: "makeup-artists",
    description: "Professional makeup services for your special day",
    essential: false
  },
  {
    name: "Hair Stylists",
    slug: "hair-stylists",
    description: "Expert hair styling for the wedding party",
    essential: false
  }
];
