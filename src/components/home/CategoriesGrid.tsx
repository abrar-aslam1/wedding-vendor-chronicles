import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
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
  {
    id: 9,
    name: "Wedding Decorators",
    description: "Transform your venue with stunning decorations",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    slug: "wedding-decorators"
  },
];

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
}

export const CategoriesGrid = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory === 'caterers') {
        console.log('Fetching subcategories for caterers...');
        const { data, error } = await supabase
          .from('vendor_subcategories')
          .select('*')
          .eq('category', 'caterers');

        if (error) {
          console.error('Error fetching subcategories:', error);
          return;
        }

        console.log('Fetched subcategories:', data);
        setSubcategories(data);
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const handleCategoryClick = (slug: string) => {
    console.log('Category clicked:', slug);
    if (slug === 'caterers') {
      setSelectedCategory(slug);
    } else {
      navigate(`/search/${slug}`);
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    console.log('Subcategory clicked:', subcategoryName);
    navigate(`/search/caterers?cuisine=${encodeURIComponent(subcategoryName)}`);
  };

  return (
    <section className="py-6 px-6 md:py-12 md:bg-gray-50 lg:py-20">
      <div className="max-w-md mx-auto md:max-w-3xl lg:max-w-7xl">
        <div className="text-center lg:mb-16">
          <h2 className="text-xl font-bold text-center mb-6 text-wedding-text md:text-3xl md:mb-8 lg:text-4xl lg:mb-4">Wedding Vendor Categories</h2>
          <p className="hidden md:block text-base md:text-lg text-wedding-text/70 max-w-2xl mx-auto">
            Browse through our curated selection of wedding professionals to find the perfect vendors for your special day
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto md:max-w-none md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`hover:shadow-lg transition-all duration-300 group cursor-pointer md:hover:shadow-xl lg:hover:shadow-2xl md:hover:-translate-y-1 lg:hover:-translate-y-2 ${
                selectedCategory === 'caterers' && category.slug !== 'caterers' ? 'opacity-50' : ''
              }`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="aspect-[5/3] md:aspect-[4/3] lg:aspect-[4/3] w-full overflow-hidden rounded-t-lg relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                </div>
              </div>
              <CardHeader className="p-3 md:p-4 lg:p-4">
                <CardTitle className="text-base text-wedding-text md:text-lg lg:text-lg">{category.name}</CardTitle>
                <CardDescription className="text-xs md:text-sm lg:text-sm">{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {selectedCategory === 'caterers' && category.slug === 'caterers' ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-gray-600">Select a Cuisine:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {subcategories.map((subcategory) => (
                        <Button
                          key={subcategory.id}
                          variant="outline"
                          className="text-sm py-2 h-auto w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryClick(subcategory.name);
                          }}
                        >
                          {subcategory.name}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2 text-wedding-primary hover:text-wedding-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(null);
                      }}
                    >
                      Back to Categories
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full text-wedding-primary hover:text-wedding-accent md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:duration-300"
                  >
                    Browse {category.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
