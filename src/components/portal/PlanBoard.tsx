import { useEffect, useState } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy 
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlanBoardColumn, PlanBoardItem } from "@/types/planboard";
import { Column } from "./planboard/Column";
import { AddColumnForm } from "./planboard/AddColumnForm";
import { EssentialVendorsGuide } from "./planboard/EssentialVendorsGuide";

const PlanBoard = () => {
  const [columns, setColumns] = useState<PlanBoardColumn[]>([]);
  const [items, setItems] = useState<PlanBoardItem[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    fetchBoardData();
  }, []);
  
  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your plan board",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('plan_board_columns')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position', { ascending: true });
        
      if (columnsError) throw columnsError;
      
      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('plan_board_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position', { ascending: true });
        
      if (itemsError) throw itemsError;
      
      // If no columns exist, create default columns
      if (columnsData.length === 0) {
        await createDefaultColumns(session.user.id);
        return;
      }
      
      setColumns(columnsData);
      setItems(itemsData);
    } catch (error: any) {
      toast({
        title: "Error loading plan board",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createDefaultColumns = async (userId: string) => {
    const defaultColumns = [
      { name: "Considering", position: 0 },
      { name: "Contacted", position: 1 },
      { name: "Meeting Scheduled", position: 2 },
      { name: "Booked", position: 3 }
    ];
    
    try {
      for (const column of defaultColumns) {
        await supabase
          .from('plan_board_columns')
          .insert({
            user_id: userId,
            name: column.name,
            position: column.position
          });
      }
      
      // Refetch data
      fetchBoardData();
    } catch (error: any) {
      toast({
        title: "Error creating default columns",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the active item
    const activeItem = items.find(item => item.id === activeId);
    
    // If we're not dragging an item or the over element is the same column, return
    if (!activeItem || activeItem.column_id === overId) return;
    
    // Check if we're dragging over a column
    const isOverColumn = columns.some(col => col.id === overId);
    
    if (isOverColumn) {
      // Update the item's column_id
      setItems(items.map(item => {
        if (item.id === activeId) {
          return { ...item, column_id: overId };
        }
        return item;
      }));
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if we're dragging a column
    const isColumn = columns.some(col => col.id === activeId);
    
    if (isColumn && activeId !== overId) {
      // Find the indices of the active and over columns
      const activeIndex = columns.findIndex(col => col.id === activeId);
      const overIndex = columns.findIndex(col => col.id === overId);
      
      // Reorder the columns
      const newColumns = arrayMove(columns, activeIndex, overIndex);
      
      // Update the positions
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        position: index
      }));
      
      setColumns(updatedColumns);
      
      // Update in the database
      try {
        for (const column of updatedColumns) {
          await supabase
            .from('plan_board_columns')
            .update({ position: column.position })
            .eq('id', column.id);
        }
      } catch (error: any) {
        toast({
          title: "Error updating columns",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // We're dragging an item
      const activeItem = items.find(item => item.id === activeId);
      
      if (!activeItem) return;
      
      // If the item was dropped on a column, update its column_id
      const isOverColumn = columns.some(col => col.id === overId);
      
      if (isOverColumn && activeItem.column_id !== overId) {
        // Get the new position (last in the column)
        const columnItems = items.filter(item => item.column_id === overId);
        const newPosition = columnItems.length;
        
        // Update the item
        const updatedItem = {
          ...activeItem,
          column_id: overId,
          position: newPosition
        };
        
        // Update the items state
        setItems(items.map(item => {
          if (item.id === activeId) {
            return updatedItem;
          }
          return item;
        }));
        
        // Update in the database
        try {
          await supabase
            .from('plan_board_items')
            .update({
              column_id: overId,
              position: newPosition
            })
            .eq('id', activeId);
        } catch (error: any) {
          toast({
            title: "Error updating item",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
    
    setActiveId(null);
  };
  
  const handleAddColumn = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const newPosition = columns.length;
      
      const { data, error } = await supabase
        .from('plan_board_columns')
        .insert({
          user_id: session.user.id,
          name,
          position: newPosition
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setColumns([...columns, data]);
      setIsAddingColumn(false);
    } catch (error: any) {
      toast({
        title: "Error adding column",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    try {
      // Delete the column
      const { error } = await supabase
        .from('plan_board_columns')
        .delete()
        .eq('id', columnId);
        
      if (error) throw error;
      
      // Update the columns state
      setColumns(columns.filter(col => col.id !== columnId));
      
      // Remove items in this column
      setItems(items.filter(item => item.column_id !== columnId));
      
      // Reorder the remaining columns
      const updatedColumns = columns
        .filter(col => col.id !== columnId)
        .map((col, index) => ({
          ...col,
          position: index
        }));
      
      // Update positions in the database
      for (const column of updatedColumns) {
        await supabase
          .from('plan_board_columns')
          .update({ position: column.position })
          .eq('id', column.id);
      }
    } catch (error: any) {
      toast({
        title: "Error deleting column",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAddItem = async (columnId: string, itemData: Partial<PlanBoardItem>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Get the new position (last in the column)
      const columnItems = items.filter(item => item.column_id === columnId);
      const newPosition = columnItems.length;
      
      const { data, error } = await supabase
        .from('plan_board_items')
        .insert({
          user_id: session.user.id,
          column_id: columnId,
          title: itemData.title || '',
          description: itemData.description,
          budget: itemData.budget,
          notes: itemData.notes,
          vendor_id: itemData.vendor_id,
          vendor_data: itemData.vendor_data,
          category: itemData.category,
          position: newPosition
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setItems([...items, data]);
    } catch (error: any) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateItem = async (itemId: string, itemData: Partial<PlanBoardItem>) => {
    try {
      const { error } = await supabase
        .from('plan_board_items')
        .update({
          title: itemData.title,
          description: itemData.description,
          budget: itemData.budget,
          notes: itemData.notes,
          category: itemData.category
        })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the items state
      setItems(items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...itemData };
        }
        return item;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('plan_board_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the items state
      setItems(items.filter(item => item.id !== itemId));
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-wedding-text">My Plan Board</h2>
        <Button 
          onClick={() => setIsAddingColumn(true)}
          className="bg-wedding-primary hover:bg-wedding-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
      
      <EssentialVendorsGuide />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wedding-primary"></div>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
            <SortableContext 
              items={columns.map(col => col.id)} 
              strategy={horizontalListSortingStrategy}
            >
              {columns.map(column => (
                <Column 
                  key={column.id} 
                  column={column} 
                  items={items.filter(item => item.column_id === column.id)}
                  onAddItem={(itemData) => handleAddItem(column.id, itemData)}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onDeleteColumn={() => handleDeleteColumn(column.id)}
                />
              ))}
            </SortableContext>
            
            {isAddingColumn && (
              <AddColumnForm 
                onCancel={() => setIsAddingColumn(false)}
                onAdd={handleAddColumn}
              />
            )}
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default PlanBoard;
