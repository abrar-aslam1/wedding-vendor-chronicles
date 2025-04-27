import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, DollarSign, X, Check, GripVertical, Tag } from "lucide-react";
import { PlanBoardItem, essentialCategories } from "@/types/planboard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemProps {
  item: PlanBoardItem;
  onUpdate: (data: Partial<PlanBoardItem>) => void;
  onDelete: () => void;
}

export const Item = ({ item, onUpdate, onDelete }: ItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [budget, setBudget] = useState(item.budget?.toString() || "");
  const [category, setCategory] = useState(item.category || "");
  const isMobile = useIsMobile();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  const handleSave = () => {
    onUpdate({
      title,
      description: description || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      category: category || undefined
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTitle(item.title);
    setDescription(item.description || "");
    setBudget(item.budget?.toString() || "");
    setCategory(item.category || "");
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <Card
        className="p-3 bg-white shadow-sm"
      >
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full"
          />
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full min-h-[80px]"
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
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              className="h-8 bg-wedding-primary hover:bg-wedding-primary/90"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-medium text-wedding-text ${isMobile ? 'text-sm' : ''}`}>{item.title}</h3>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-600 mt-2">{item.description}</p>
      )}
      
      <div className={`flex flex-wrap gap-2 mt-2 ${isMobile ? 'text-xs' : ''}`}>
        {item.category && (
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1 text-gray-600" />
            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
              {essentialCategories.find(cat => cat.slug === item.category)?.name || item.category}
            </Badge>
          </div>
        )}
        
        {item.budget && (
          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>${item.budget.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className={`flex ${isMobile ? 'justify-between' : 'justify-end'} gap-2 mt-3`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-red-500"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
