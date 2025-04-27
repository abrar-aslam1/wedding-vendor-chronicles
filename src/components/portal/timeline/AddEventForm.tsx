import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Calendar } from "lucide-react";
import { TimelineEventType } from "@/types/timeline";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface AddEventFormProps {
  onCancel: () => void;
  onAdd: (data: Partial<TimelineEventType>) => void;
}

export const AddEventForm = ({ onCancel, onAdd }: AddEventFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      date
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setDate("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Event Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          className="w-full"
          required
          autoFocus
        />
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <div className="relative">
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
            required
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this event"
          className="w-full min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-wedding-primary hover:bg-wedding-primary/90"
        >
          <Check className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
    </form>
  );
};
