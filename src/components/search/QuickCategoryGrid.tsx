import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubcategoryModal } from './SubcategoryModal';

interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

const VENDOR_CATEGORIES: Category[] = [
  { name: 'Photographers', slug: 'photographers', icon: '📸', description: 'Capture your special moments' },
  { name: 'Videographers', slug: 'videographers', icon: '🎥', description: 'Professional video services' },
  { name: 'Florists', slug: 'florists', icon: '💐', description: 'Beautiful wedding flowers' },
  { name: 'Wedding Planners', slug: 'wedding-planners', icon: '📋', description: 'Expert planning services' },
  { name: 'Venues', slug: 'venues', icon: '🏛️', description: 'Perfect ceremony locations' },
  { name: 'Caterers', slug: 'caterers', icon: '🍽️', description: 'Delicious wedding cuisine' },
  { name: 'DJs & Bands', slug: 'djs-and-bands', icon: '🎵', description: 'Entertainment & music' },
  { name: 'Cake Designers', slug: 'cake-designers', icon: '🍰', description: 'Custom wedding cakes' },
  { name: 'Makeup Artists', slug: 'makeup-artists', icon: '💄', description: 'Bridal beauty services' },
  { name: 'Hair Stylists', slug: 'hair-stylists', icon: '💇', description: 'Wedding hair styling' },
  { name: 'Wedding Decorators', slug: 'wedding-decorators', icon: '🎨', description: 'Decor & design services' },
  { name: 'Bridal Shops', slug: 'bridal-shops', icon: '👰', description: 'Wedding dress boutiques' },
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
        {VENDOR_CATEGORIES.map((category) => (
          <Button
            key={category.slug}
            variant="outline"
            onClick={() => handleCategoryClick(category)}
            className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 hover:bg-wedding-primary/10 hover:border-wedding-primary transition-all duration-200 group"
            title={category.description}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
              {category.icon}
            </span>
            <span className="text-xs font-medium text-center leading-tight">
              {category.name}
            </span>
          </Button>
        ))}
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
