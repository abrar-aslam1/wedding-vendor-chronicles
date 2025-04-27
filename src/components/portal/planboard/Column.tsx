import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Trash } from "lucide-react";
import { PlanBoardColumn, PlanBoardItem } from "@/types/planboard";
import { Item } from "@/components/portal/planboard/Item";
import { AddItemForm } from "@/components/portal/planboard/AddItemForm";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnProps {
  column: PlanBoardColumn;
  items: PlanBoardItem[];
  onAddItem: (itemData: Partial<PlanBoardItem>) => void;
  onUpdateItem: (itemId: string, itemData: Partial<PlanBoardItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteColumn: () => void;
}

export const Column = ({ 
  column, 
  items, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  onDeleteColumn 
}: ColumnProps) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isMobile ? 'w-full mb-4' : 'flex-shrink-0 w-80'} bg-gray-50 rounded-lg shadow-sm`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="font-semibold text-wedding-text cursor-grab active:cursor-grabbing px-2 py-1 flex-1"
            {...attributes}
            {...listeners}
          >
            {column.name}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500"
                onClick={onDeleteColumn}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className={`mt-3 space-y-3 ${isMobile ? 'max-h-[300px]' : 'max-h-[calc(100vh-250px)]'} overflow-y-auto p-1`}>
          {items.map(item => (
            <Item 
              key={item.id} 
              item={item} 
              onUpdate={(data) => onUpdateItem(item.id, data)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
          
          {isAddingItem ? (
            <AddItemForm 
              onCancel={() => setIsAddingItem(false)}
              onAdd={(data) => {
                onAddItem(data);
                setIsAddingItem(false);
              }}
            />
          ) : (
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-wedding-primary hover:bg-gray-100"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
