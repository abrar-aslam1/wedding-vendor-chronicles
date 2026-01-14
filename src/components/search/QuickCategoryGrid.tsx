import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubcategoryModal } from './SubcategoryModal';
import { 
  Camera, 
  Video, 
  Flower2, 
  ClipboardList, 
  Building2, 
  Utensils, 
  Music, 
  Cake, 
  Sparkles, 
  Scissors,
  Palette,
  Heart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Category {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
}

const VENDOR_CATEGORIES: Category[] = [
  { name: 'Photographers', slug: 'photographers', icon: Camera, description: 'Capture your special moments' },
  { name: 'Videographers', slug: 'videographers', icon: Video, description: 'Professional video services' },
  { name: 'Florists', slug: 'florists', icon: Flower2, description: 'Beautiful wedding flowers' },
  { name: 'Wedding Planners', slug: 'wedding-planners', icon: ClipboardList, description: 'Expert planning services' },
  { name: 'Venues', slug: 'venues', icon: Building2, description: 'Perfect ceremony locations' },
  { name: 'Caterers', slug: 'caterers', icon: Utensils, description: 'Delicious wedding cuisine' },
  { name: 'DJs & Bands', slug: 'djs-and-bands', icon: Music, description: 'Entertainment & music' },
  { name: 'Cake Designers', slug: 'cake-designers', icon: Cake, description: 'Custom wedding cakes' },
  { name: 'Makeup Artists', slug: 'makeup-artists', icon: Sparkles, description: 'Bridal beauty services' },
  { name: 'Hair Stylists', slug: 'hair-stylists', icon: Scissors, description: 'Wedding hair styling' },
  { name: 'Wedding Decorators', slug: 'wedding-decorators', icon: Palette, description: 'Decor & design services' },
  { name: 'Bridal Shops', slug: 'bridal-shops', icon: Heart, description: 'Wedding dress boutiques' },
];

interface QuickCategoryGridProps {
  city: string;
  state: string;
  onCategorySelect?: (category: string) => void;
}

export const QuickCategoryGrid = ({ city, state, onCategorySelect }: QuickCategoryGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategoryClick = (category: Category) => {
    console.log('Category clicked:', category.name, { city, state });
    
    // Call optional callback
    if (onCategorySelect) {
      onCategorySelect(category.name);
    }
    
    // Open subcategory modal
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-wedding-text mb-2">
          Select Your Vendor Type
        </h3>
        <p className="text-sm text-wedding-text/70">
          Choose a category to see vendors in {city}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {VENDOR_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.slug}
              variant="outline"
              onClick={() => handleCategoryClick(category)}
              className="h-auto py-5 px-3 flex flex-col items-center justify-center gap-3 border-wedding-primary/20 hover:border-wedding-primary transition-all duration-300 group relative overflow-hidden"
              title={category.description}
            >
              {/* Liquid glass icon container */}
              <div className="liquid-glass rounded-xl p-3 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                <IconComponent className="w-7 h-7 text-wedding-primary group-hover:text-wedding-accent transition-colors duration-300" />
              </div>
              
              <span className="text-xs font-semibold text-center leading-tight text-wedding-text group-hover:text-wedding-primary transition-colors duration-300">
                {category.name}
              </span>
              
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-primary/5 to-wedding-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Button>
          );
        })}
      </div>

      {/* Subcategory Modal */}
      {selectedCategory && (
        <SubcategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          category={selectedCategory}
          city={city}
          state={state}
        />
      )}
    </div>
  );
};
