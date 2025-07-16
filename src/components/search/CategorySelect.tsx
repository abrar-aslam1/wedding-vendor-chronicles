import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Wedding Planners",
  "Photographers",
  "Videographers",
  "Florists",
  "Caterers",
  "Venues",
  "DJs & Bands",
  "Cake Designers",
  "Bridal Shops",
  "Makeup Artists",
  "Hair Stylists",
  "Wedding Decorators",
  "Carts",
];

interface CategorySelectProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  isSearching: boolean;
  preselectedCategory?: string;
}

export const CategorySelect = ({
  selectedCategory,
  setSelectedCategory,
  isSearching,
  preselectedCategory,
}: CategorySelectProps) => {
  if (preselectedCategory) return null;

  return (
    <Select
      value={selectedCategory}
      onValueChange={setSelectedCategory}
      disabled={isSearching || !!preselectedCategory}
    >
      <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
        <SelectValue placeholder="What vendor are you looking for?" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
