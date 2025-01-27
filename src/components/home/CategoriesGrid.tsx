import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Wedding Planners",
    description: "Professional planners to orchestrate your perfect day",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
    slug: "wedding-planners"
  },
  {
    id: 2,
    name: "Photographers",
    description: "Capture every magical moment",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e048b",
    slug: "photographers"
  },
  {
    id: 3,
    name: "Videographers",
    description: "Create lasting memories in motion",
    image: "https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d",
    slug: "videographers"
  },
  {
    id: 4,
    name: "Florists",
    description: "Beautiful floral arrangements for your special day",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    slug: "florists"
  },
  {
    id: 5,
    name: "Caterers",
    description: "Delicious cuisine for your reception",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033",
    slug: "caterers"
  },
  {
    id: 6,
    name: "Venues",
    description: "Perfect locations for your ceremony and reception",
    image: "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
    slug: "venues"
  },
  {
    id: 7,
    name: "DJs & Bands",
    description: "Entertainment to keep the party going",
    image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4",
    slug: "djs-and-bands"
  },
  {
    id: 8,
    name: "Cake Designers",
    description: "Beautiful and delicious wedding cakes",
    image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52",
    slug: "cake-designers"
  },
];

export const CategoriesGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/search/${categorySlug}`);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-wedding-text">Wedding Vendor Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
              <div 
                className="aspect-video w-full overflow-hidden rounded-t-lg relative"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-wedding-text">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full text-wedding-primary hover:text-wedding-accent"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  Browse {category.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};