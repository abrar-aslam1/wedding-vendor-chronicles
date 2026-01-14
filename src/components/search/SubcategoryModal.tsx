import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { getSubcategoriesForCategory } from '@/config/subcategories';
import { X, LucideIcon } from 'lucide-react';

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    name: string;
    slug: string;
    icon: LucideIcon;
  };
  city: string;
  state: string;
}

export const SubcategoryModal = ({
  isOpen,
  onClose,
  category,
  city,
  state,
}: SubcategoryModalProps) => {
  const navigate = useNavigate();
  const subcategories = getSubcategoriesForCategory(category.slug);
  const IconComponent = category.icon;

  const handleSubcategoryClick = (subcategorySlug: string) => {
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const formattedState = state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const searchUrl = `/top-20/${category.slug}/${formattedCity}/${formattedState}?subcategory=${subcategorySlug}`;
    
    console.log('Navigating to subcategory:', searchUrl);
    navigate(searchUrl);
    onClose();
  };

  const handleSeeAll = () => {
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const formattedState = state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const searchUrl = `/top-20/${category.slug}/${formattedCity}/${formattedState}`;
    
    console.log('Navigating to all:', searchUrl);
    navigate(searchUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Liquid glass icon container */}
              <div className="liquid-glass rounded-2xl p-4">
                <IconComponent className="w-10 h-10 text-wedding-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Choose {category.name} Style
                </DialogTitle>
                <DialogDescription>
                  Select a specialty in {city}, or see all {category.name.toLowerCase()}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Subcategories Grid */}
          {subcategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory.slug}
                  variant="outline"
                  onClick={() => handleSubcategoryClick(subcategory.slug)}
                  className="h-auto py-4 px-4 flex flex-col items-start text-left hover:bg-wedding-primary/10 hover:border-wedding-primary transition-all duration-200 group"
                >
                  <span className="font-semibold text-sm group-hover:text-wedding-primary transition-colors">
                    {subcategory.name}
                  </span>
                  {subcategory.description && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {subcategory.description}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No subcategories available for this category
            </p>
          )}

          {/* See All Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSeeAll}
              className="w-full bg-wedding-primary hover:bg-wedding-primary/90 text-white py-6 text-base font-semibold"
            >
              See All {category.name} in {city}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Browse all {category.name.toLowerCase()} without filtering by specialty
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
