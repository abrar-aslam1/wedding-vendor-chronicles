import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddColumnFormProps {
  onCancel: () => void;
  onAdd: (name: string) => void;
}

export const AddColumnForm = ({ onCancel, onAdd }: AddColumnFormProps) => {
  const [name, setName] = useState("");
  const isMobile = useIsMobile();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onAdd(name.trim());
    
    // Reset form
    setName("");
  };
  
  return (
    <div className={`${isMobile ? 'w-full' : 'flex-shrink-0 w-80'} bg-gray-50 rounded-lg shadow-sm`}>
      <Card className="p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="font-semibold text-wedding-text mb-2">Add New Column</h3>
          
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Column Name"
            className="w-full"
            required
            autoFocus
          />
          
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
    </div>
  );
};
