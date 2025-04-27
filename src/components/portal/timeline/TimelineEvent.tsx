import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash, Calendar } from "lucide-react";
import { TimelineEventType } from "@/types/timeline";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimelineEventProps {
  event: TimelineEventType;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const TimelineEvent = ({ event, onToggleComplete, onDelete }: TimelineEventProps) => {
  const formattedDate = format(new Date(event.date), "MMMM d, yyyy");
  const isMobile = useIsMobile();
  
  return (
    <div className="flex">
      <div className={`relative flex items-center justify-center ${isMobile ? 'w-6 h-6 mr-2' : 'w-8 h-8 mr-4'}`}>
        <div 
          className={`z-10 w-4 h-4 rounded-full ${
            event.completed ? 'bg-green-500' : 'bg-wedding-primary'
          }`}
        />
      </div>
      
      <Card className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} ${
        event.completed ? 'bg-gray-50 border-green-200' : 'bg-white'
      }`}>
        <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex justify-between items-start'}`}>
          <div>
            <h3 className={`font-medium ${
              event.completed ? 'text-gray-500 line-through' : 'text-wedding-text'
            }`}>
              {event.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className={`flex gap-2 ${isMobile ? 'self-end' : ''}`}>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 ${
                event.completed 
                  ? 'bg-green-50 border-green-200 text-green-500' 
                  : 'text-gray-500'
              }`}
              onClick={onToggleComplete}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-500"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {event.description && (
          <p className={`text-sm mt-2 ${
            event.completed ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {event.description}
          </p>
        )}
      </Card>
    </div>
  );
};
