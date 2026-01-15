'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  {
    id: 1,
    name: "Wedding Planners",
    description: "Professional planners to orchestrate your celebration",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
    slug: "wedding-planners"
  },
  {
    id: 2,
    name: "Photographers",
    description: "Capture every meaningful moment beautifully",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    slug: "photographers"
  },
  {
    id: 3,
    name: "Videographers",
    description: "Create cinematic memories that last forever",
    image: "https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d",
    slug: "videographers"
  },
  {
    id: 4,
    name: "Florists",
    description: "Beautiful floral arrangements for your celebration",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    slug: "florists"
  },
  {
    id: 5,
    name: "Caterers",
    description: "Exceptional cuisine for your guests",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033",
    slug: "caterers"
  },
  {
    id: 6,
    name: "Venues",
    description: "Perfect locations for your ceremony and celebration",
    image: "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
    slug: "venues"
  },
  {
    id: 7,
    name: "DJs & Bands",
    description: "Live entertainment to energize your celebration",
    image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4",
    slug: "djs-and-bands"
  },
  {
    id: 8,
    name: "Cake Designers",
    description: "Custom cakes crafted to perfection",
    image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52",
    slug: "cake-designers"
  },
  {
    id: 9,
    name: "Wedding Decorators",
    description: "Transform your venue with stunning designs",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    slug: "wedding-decorators"
  },
  {
    id: 10,
    name: "Carts",
    description: "Mobile service stations for unique experiences",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    slug: "carts"
  },
];

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
}

export const CategoriesGrid = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory === 'caterers') {
        const { data, error } = await supabase
          .from('vendor_subcategories')
          .select('*')
          .eq('category', 'caterers');

        if (error) {
          console.error('Error fetching subcategories:', error);
          return;
        }

        setSubcategories(data);
      } else if (selectedCategory === 'carts') {
        // Static cart subcategories until they are added to the database
        const cartSubcategories = [
          {
            id: '1',
            name: 'Coffee Carts',
            description: 'Mobile coffee stations with barista service for ceremonies and receptions'
          },
          {
            id: '2',
            name: 'Matcha Carts',
            description: 'Specialty matcha and tea service carts for unique wedding experiences'
          },
          {
            id: '3',
            name: 'Cocktail Carts',
            description: 'Mobile bar carts with bartender service for cocktail hour and reception'
          },
          {
            id: '4',
            name: 'Dessert Carts',
            description: 'Mobile dessert stations with ice cream, pastries, and sweet treats'
          },
          {
            id: '5',
            name: 'Flower Carts',
            description: 'Mobile floral arrangements and flower crown stations'
          },
          {
            id: '6',
            name: 'Champagne Carts',
            description: 'Elegant champagne service carts for toasts and celebrations'
          }
        ];
        setSubcategories(cartSubcategories);
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const handleCategoryClick = (slug: string) => {
    if (slug === 'caterers' || slug === 'carts') {
      setSelectedCategory(slug);
    } else {
      // Redirect to states page for location selection
      router.push(`/states?category=${slug}`);
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    if (selectedCategory === 'caterers') {
      router.push(`/search/caterers?cuisine=${encodeURIComponent(subcategoryName)}`);
    } else if (selectedCategory === 'carts') {
      router.push(`/search/carts?subcategory=${encodeURIComponent(subcategoryName)}`);
    }
  };

  return (
    <section className="pt-8 pb-16 px-6 md:pt-12 md:pb-20 md:bg-gray-50 lg:pt-16 lg:pb-24">
      <div className="max-w-md mx-auto md:max-w-3xl lg:max-w-7xl">
        <div className="text-center lg:mb-12">
          <h2 className="text-2xl font-extrabold text-center mb-6 text-wedding-text md:text-3xl md:mb-8 lg:text-5xl lg:mb-8 tracking-tight drop-shadow-sm">Wedding Vendor Categories</h2>
          <p className="hidden md:block text-base md:text-lg lg:text-xl text-wedding-text/85 max-w-2xl mx-auto leading-relaxed font-medium">
            Browse through our curated selection of wedding professionals to find the perfect vendors for your celebration
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto md:max-w-none md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`liquid-glass hover:shadow-[0_8px_32px_rgba(44,62,80,0.2)] border-[rgba(232,212,176,0.3)] transition-all duration-400 group cursor-pointer md:hover:-translate-y-2 lg:hover:-translate-y-3 transform-gpu ${
                selectedCategory && category.slug !== selectedCategory ? 'opacity-50 scale-95' : ''
              }`}
              style={{
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="aspect-[5/3] md:aspect-[4/3] lg:aspect-[4/3] w-full overflow-hidden rounded-t-lg relative">
                <div className="absolute inset-0 bg-gradient-to-t from-wedding-primary/50 via-wedding-primary/20 to-transparent opacity-20 group-hover:opacity-60 transition-opacity duration-400" />
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end p-4 md:p-5 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-lg">{category.name}</h3>
                </div>
              </div>
              <CardHeader className="p-4 md:p-5 lg:p-6">
                <CardTitle className="text-lg text-wedding-text md:text-xl lg:text-xl font-bold">{category.name}</CardTitle>
                <CardDescription className="text-sm md:text-base lg:text-base text-wedding-text/80 leading-relaxed font-medium">{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {selectedCategory && category.slug === selectedCategory ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-700">
                      {selectedCategory === 'caterers' ? 'Select a Cuisine:' : 'Select a Cart Type:'}
                    </h3>
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
                    className="w-full text-wedding-primary hover:text-wedding-accent hover:bg-wedding-primary/5 md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-400 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-400 font-semibold"
                  >
                    Browse {category.name} →
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
