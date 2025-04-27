import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check, DollarSign, Tag } from "lucide-react";
import { PlanBoardItem, essentialCategories, VendorCategory } from "@/types/planboard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AddItemFormProps {
  onCancel: () => void;
  onAdd: (data: Partial<PlanBoardItem>) => void;
}

export const AddItemForm = ({ onCancel, onAdd }: AddItemFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | undefined>(undefined);
  
  useEffect(() => {
    if (category) {
      const found = essentialCategories.find(cat => cat.slug === category);
      setSelectedCategory(found);
      
      // If a category is selected and there's no description yet, pre-fill with category description
      if (found && !description) {
        setDescription(found.description);
      }
    }
  }, [category, description]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      category: category
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setBudget("");
    setCategory(undefined);
    setSelectedCategory(undefined);
  };
  
  return (
    <Card className="p-3 bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full"
          required
          autoFocus
        />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Vendor Category</span>
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a vendor category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Essential Vendors</SelectLabel>
                {essentialCategories
                  .filter(cat => cat.essential)
                  .map(cat => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      <div className="flex items-center gap-2">
                        {cat.name}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Essential
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Other Vendors</SelectLabel>
                {essentialCategories
                  .filter(cat => !cat.essential)
                  .map(cat => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full min-h-[80px]"
        />
        
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
          <Input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget"
            type="number"
            step="0.01"
            min="0"
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-3">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="default" 
            size="sm" 
            className="h-8 bg-wedding-primary hover:bg-wedding-primary/90"
          >
            <Check className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </form>
    </Card>
  );
};
