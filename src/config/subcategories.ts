// Subcategories for each main vendor category
// These allow more specific categorization of vendors

export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryWithSubcategories {
  categorySlug: string;
  categoryName: string;
  subcategories: Subcategory[];
}

export const subcategoriesByCategory: CategoryWithSubcategories[] = [
  {
    categorySlug: "photographers",
    categoryName: "Photographers",
    subcategories: [
      { name: "Documentary Wedding Photographer", slug: "documentary-wedding-photographer", description: "Candid, storytelling approach" },
      { name: "Fine Art Wedding Photographer", slug: "fine-art-wedding-photographer", description: "Artistic, editorial style" },
      { name: "Traditional Wedding Photographer", slug: "traditional-wedding-photographer", description: "Classic posed portraits" },
      { name: "Moody Wedding Photographer", slug: "moody-wedding-photographer", description: "Dark, dramatic aesthetic" },
      { name: "Light & Airy Photographer", slug: "light-and-airy-photographer", description: "Bright, soft editing style" },
      { name: "Indian Wedding Photographer", slug: "indian-wedding-photographer", description: "Specializes in South Asian weddings" },
      { name: "Destination Wedding Photographer", slug: "destination-wedding-photographer", description: "Travel for weddings worldwide" },
      { name: "Elopement Photographer", slug: "elopement-photographer", description: "Intimate, small ceremony specialist" },
      { name: "Engagement Photographer", slug: "engagement-photographer", description: "Pre-wedding photo sessions" },
      { name: "Bridal Portrait Photographer", slug: "bridal-portrait-photographer", description: "Bride-focused portrait sessions" },
    ]
  },
  {
    categorySlug: "videographers",
    categoryName: "Videographers",
    subcategories: [
      { name: "Cinematic Wedding Videographer", slug: "cinematic-wedding-videographer", description: "Film-like production quality" },
      { name: "Documentary Wedding Videographer", slug: "documentary-wedding-videographer", description: "Story-driven, candid footage" },
      { name: "Drone Videographer", slug: "drone-videographer", description: "Aerial footage specialist" },
      { name: "Same Day Edit Videographer", slug: "same-day-edit-videographer", description: "Quick turnaround highlight reels" },
      { name: "Indian Wedding Videographer", slug: "indian-wedding-videographer", description: "South Asian wedding specialist" },
      { name: "Live Streaming Videographer", slug: "live-streaming-videographer", description: "Virtual wedding broadcasts" },
    ]
  },
  {
    categorySlug: "florists",
    categoryName: "Florists",
    subcategories: [
      { name: "Luxury Wedding Florist", slug: "luxury-wedding-florist", description: "High-end, premium arrangements" },
      { name: "Bohemian Florist", slug: "bohemian-florist", description: "Wildflower, organic designs" },
      { name: "Modern Florist", slug: "modern-florist", description: "Contemporary, minimalist style" },
      { name: "Garden Style Florist", slug: "garden-style-florist", description: "Lush, romantic arrangements" },
      { name: "Sustainable Florist", slug: "sustainable-florist", description: "Eco-friendly, locally sourced" },
      { name: "Indian Wedding Florist", slug: "indian-wedding-florist", description: "Marigolds, jasmine, traditional" },
      { name: "Tropical Florist", slug: "tropical-florist", description: "Exotic, destination wedding style" },
    ]
  },
  {
    categorySlug: "wedding-planners",
    categoryName: "Wedding Planners",
    subcategories: [
      { name: "Full Service Wedding Planner", slug: "full-service-wedding-planner", description: "Complete planning from start to finish" },
      { name: "Day-Of Coordinator", slug: "day-of-coordinator", description: "Wedding day management only" },
      { name: "Partial Planning Coordinator", slug: "partial-planning-coordinator", description: "Select services and guidance" },
      { name: "Destination Wedding Planner", slug: "destination-wedding-planner", description: "Remote/travel wedding specialist" },
      { name: "Luxury Wedding Planner", slug: "luxury-wedding-planner", description: "High-end, exclusive events" },
      { name: "Indian Wedding Planner", slug: "indian-wedding-planner", description: "Multi-day cultural wedding expert" },
      { name: "Elopement Planner", slug: "elopement-planner", description: "Intimate ceremony specialist" },
      { name: "Cultural Wedding Planner", slug: "cultural-wedding-planner", description: "Multi-cultural ceremony expert" },
    ]
  },
  {
    categorySlug: "venues",
    categoryName: "Venues",
    subcategories: [
      { name: "Barn Wedding Venue", slug: "barn-wedding-venue", description: "Rustic, country setting" },
      { name: "Beach Wedding Venue", slug: "beach-wedding-venue", description: "Oceanfront ceremonies" },
      { name: "Garden Wedding Venue", slug: "garden-wedding-venue", description: "Outdoor, botanical settings" },
      { name: "Ballroom Wedding Venue", slug: "ballroom-wedding-venue", description: "Elegant, indoor spaces" },
      { name: "Vineyard Wedding Venue", slug: "vineyard-wedding-venue", description: "Winery and vineyard settings" },
      { name: "Historic Wedding Venue", slug: "historic-wedding-venue", description: "Heritage, mansion properties" },
      { name: "Rooftop Wedding Venue", slug: "rooftop-wedding-venue", description: "Urban, city skyline views" },
      { name: "Mountain Wedding Venue", slug: "mountain-wedding-venue", description: "Scenic, elevated locations" },
      { name: "Intimate Wedding Venue", slug: "intimate-wedding-venue", description: "Small guest count specialist" },
      { name: "All-Inclusive Wedding Venue", slug: "all-inclusive-wedding-venue", description: "Complete wedding packages" },
    ]
  },
  {
    categorySlug: "caterers",
    categoryName: "Caterers",
    subcategories: [
      { name: "Farm to Table Caterer", slug: "farm-to-table-caterer", description: "Local, seasonal ingredients" },
      { name: "Indian Wedding Caterer", slug: "indian-wedding-caterer", description: "South Asian cuisine specialist" },
      { name: "BBQ Wedding Caterer", slug: "bbq-wedding-caterer", description: "Southern, smoked cuisine" },
      { name: "Vegan Wedding Caterer", slug: "vegan-wedding-caterer", description: "Plant-based menu specialist" },
      { name: "Italian Wedding Caterer", slug: "italian-wedding-caterer", description: "Mediterranean cuisine" },
      { name: "Mexican Wedding Caterer", slug: "mexican-wedding-caterer", description: "Latin American cuisine" },
      { name: "Kosher Wedding Caterer", slug: "kosher-wedding-caterer", description: "Jewish dietary law compliant" },
      { name: "Halal Wedding Caterer", slug: "halal-wedding-caterer", description: "Islamic dietary compliant" },
      { name: "Food Truck Caterer", slug: "food-truck-caterer", description: "Mobile, casual dining" },
    ]
  },
  {
    categorySlug: "djs-and-bands",
    categoryName: "DJs & Bands",
    subcategories: [
      { name: "Wedding DJ", slug: "wedding-dj", description: "Professional wedding music" },
      { name: "Live Wedding Band", slug: "live-wedding-band", description: "Full band performance" },
      { name: "Indian Wedding DJ", slug: "indian-wedding-dj", description: "Bollywood & bhangra specialist" },
      { name: "String Quartet", slug: "string-quartet", description: "Classical ceremony music" },
      { name: "Jazz Band", slug: "jazz-band", description: "Cocktail hour entertainment" },
      { name: "Latin Band", slug: "latin-band", description: "Salsa, merengue, bachata" },
      { name: "Acoustic Duo", slug: "acoustic-duo", description: "Intimate, unplugged music" },
      { name: "Solo Musician", slug: "solo-musician", description: "Single performer ceremonies" },
    ]
  },
  {
    categorySlug: "cake-designers",
    categoryName: "Cake Designers",
    subcategories: [
      { name: "Luxury Wedding Cake Designer", slug: "luxury-wedding-cake-designer", description: "High-end, custom creations" },
      { name: "Buttercream Cake Artist", slug: "buttercream-cake-artist", description: "Classic frosting style" },
      { name: "Fondant Cake Artist", slug: "fondant-cake-artist", description: "Smooth, detailed designs" },
      { name: "Naked Cake Specialist", slug: "naked-cake-specialist", description: "Rustic, unfrosted style" },
      { name: "Vegan Wedding Cake Baker", slug: "vegan-wedding-cake-baker", description: "Plant-based desserts" },
      { name: "Gluten-Free Cake Baker", slug: "gluten-free-cake-baker", description: "Allergy-friendly options" },
      { name: "Cupcake Wedding Designer", slug: "cupcake-wedding-designer", description: "Individual portion cakes" },
    ]
  },
  {
    categorySlug: "makeup-artists",
    categoryName: "Makeup Artists",
    subcategories: [
      { name: "Bridal Makeup Artist", slug: "bridal-makeup-artist", description: "Wedding day beauty" },
      { name: "Indian Bridal Makeup Artist", slug: "indian-bridal-makeup-artist", description: "South Asian bridal looks" },
      { name: "Airbrush Makeup Artist", slug: "airbrush-makeup-artist", description: "Long-lasting, flawless finish" },
      { name: "Natural Bridal Makeup", slug: "natural-bridal-makeup", description: "Subtle, enhancing looks" },
      { name: "Glam Bridal Makeup", slug: "glam-bridal-makeup", description: "Bold, dramatic looks" },
      { name: "On-Location Makeup Artist", slug: "on-location-makeup-artist", description: "Travel to wedding venue" },
    ]
  },
  {
    categorySlug: "hair-stylists",
    categoryName: "Hair Stylists",
    subcategories: [
      { name: "Bridal Hair Stylist", slug: "bridal-hair-stylist", description: "Wedding day hairstyling" },
      { name: "Updo Specialist", slug: "updo-specialist", description: "Elegant pinned styles" },
      { name: "Indian Bridal Hair Stylist", slug: "indian-bridal-hair-stylist", description: "South Asian bridal hair" },
      { name: "Boho Hair Stylist", slug: "boho-hair-stylist", description: "Loose, romantic waves" },
      { name: "On-Location Hair Stylist", slug: "on-location-hair-stylist", description: "Travel to wedding venue" },
      { name: "Hair Extensions Specialist", slug: "hair-extensions-specialist", description: "Added length and volume" },
    ]
  },
  {
    categorySlug: "wedding-decorators",
    categoryName: "Wedding Decorators",
    subcategories: [
      { name: "Luxury Wedding Decorator", slug: "luxury-wedding-decorator", description: "High-end event design" },
      { name: "Bohemian Wedding Decorator", slug: "bohemian-wedding-decorator", description: "Boho, natural aesthetic" },
      { name: "Indian Wedding Decorator", slug: "indian-wedding-decorator", description: "Mandap, mehndi decor" },
      { name: "Rustic Wedding Decorator", slug: "rustic-wedding-decorator", description: "Barn, country style" },
      { name: "Modern Wedding Decorator", slug: "modern-wedding-decorator", description: "Contemporary, minimalist" },
      { name: "Beach Wedding Decorator", slug: "beach-wedding-decorator", description: "Coastal, tropical themes" },
      { name: "Tent & Draping Specialist", slug: "tent-and-draping-specialist", description: "Fabric installations" },
      { name: "Lighting Designer", slug: "lighting-designer", description: "Ambiance and mood lighting" },
    ]
  },
  {
    categorySlug: "bridal-shops",
    categoryName: "Bridal Shops",
    subcategories: [
      { name: "Designer Bridal Boutique", slug: "designer-bridal-boutique", description: "Luxury designer gowns" },
      { name: "Vintage Bridal Shop", slug: "vintage-bridal-shop", description: "Antique and retro styles" },
      { name: "Plus Size Bridal Shop", slug: "plus-size-bridal-shop", description: "Extended size specialist" },
      { name: "Modest Bridal Shop", slug: "modest-bridal-shop", description: "Conservative, covered styles" },
      { name: "Custom Bridal Gowns", slug: "custom-bridal-gowns", description: "Made-to-measure dresses" },
      { name: "Bridal Consignment", slug: "bridal-consignment", description: "Pre-owned wedding dresses" },
      { name: "Indian Bridal Wear", slug: "indian-bridal-wear", description: "Lehengas, sarees, sherwanis" },
    ]
  },
  {
    categorySlug: "carts",
    categoryName: "Carts",
    subcategories: [
      { name: "Coffee Cart", slug: "coffee-cart", description: "Espresso and coffee service" },
      { name: "Matcha Cart", slug: "matcha-cart", description: "Japanese green tea service" },
      { name: "Cocktail Cart", slug: "cocktail-cart", description: "Mobile bar service" },
      { name: "Champagne Cart", slug: "champagne-cart", description: "Sparkling wine service" },
      { name: "Ice Cream Cart", slug: "ice-cream-cart", description: "Frozen dessert service" },
      { name: "Gelato Cart", slug: "gelato-cart", description: "Italian ice cream" },
      { name: "Photo Booth Cart", slug: "photo-booth-cart", description: "Mobile photo stations" },
      { name: "Chai Cart", slug: "chai-cart", description: "Indian tea service" },
      { name: "Dessert Cart", slug: "dessert-cart", description: "Mobile sweets service" },
    ]
  }
];

// Helper function to get subcategories for a specific category
export const getSubcategoriesForCategory = (categorySlug: string): Subcategory[] => {
  const category = subcategoriesByCategory.find(c => c.categorySlug === categorySlug);
  return category?.subcategories || [];
};

// Helper function to get all subcategories as a flat list
export const getAllSubcategories = (): Subcategory[] => {
  return subcategoriesByCategory.flatMap(c => c.subcategories);
};

// Helper function to find subcategory by slug
export const findSubcategoryBySlug = (slug: string): Subcategory | undefined => {
  for (const category of subcategoriesByCategory) {
    const found = category.subcategories.find(s => s.slug === slug);
    if (found) return found;
  }
  return undefined;
};

// Export subcategories as an object for backward compatibility with SearchForm.tsx
export const subcategories: Record<string, Array<{id: string, name: string, description: string | null}>> = 
  subcategoriesByCategory.reduce((acc, category) => {
    acc[category.categorySlug] = category.subcategories.map(sub => ({
      id: sub.slug,
      name: sub.name,
      description: sub.description || null
    }));
    return acc;
  }, {} as Record<string, Array<{id: string, name: string, description: string | null}>>);
