import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    id: 1,
    name: "Wedding Planners",
    description: "Professional planners to orchestrate your perfect day",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
  },
  {
    id: 2,
    name: "Photographers",
    description: "Capture every magical moment",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  },
  {
    id: 3,
    name: "Videographers",
    description: "Create lasting memories in motion",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
  },
  {
    id: 4,
    name: "Florists",
    description: "Beautiful floral arrangements for your special day",
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833",
  },
  {
    id: 5,
    name: "Caterers",
    description: "Delicious cuisine for your reception",
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840",
  },
  {
    id: 6,
    name: "Venues",
    description: "Perfect locations for your ceremony and reception",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
  },
  {
    id: 7,
    name: "DJs & Bands",
    description: "Entertainment to keep the party going",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
  },
  {
    id: 8,
    name: "Cake Designers",
    description: "Beautiful and delicious wedding cakes",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d",
  },
];

export const CategoriesGrid = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-wedding-text">Wedding Vendor Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
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
                <Button variant="ghost" className="w-full text-wedding-primary hover:text-wedding-accent">
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