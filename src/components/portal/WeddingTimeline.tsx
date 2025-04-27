import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Check, X, Filter, Wand2 } from "lucide-react";
import { TimelineEvent } from "@/components/portal/timeline/TimelineEvent";
import { AddEventForm } from "@/components/portal/timeline/AddEventForm";
import { TimelineEventType } from "@/types/timeline";
import { useToast } from "@/hooks/use-toast";
import { TimelineWizard } from "@/components/portal/timeline/TimelineWizard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WeddingTimeline = () => {
  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isUsingWizard, setIsUsingWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your timeline",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading timeline events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddEvent = async (eventData: Partial<TimelineEventType>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Ensure a date is provided
      if (!eventData.date) {
        toast({
          title: "Date required",
          description: "Please select a date for the event",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('timeline_events')
        .insert({
          user_id: session.user.id,
          title: eventData.title || '',
          description: eventData.description,
          date: eventData.date,
          completed: false,
          is_generated: eventData.is_generated || false,
          template_id: eventData.template_id || null,
          vendor_category: eventData.vendor_category || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setEvents([...events, data]);
      setIsAddingEvent(false);
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAddEventsFromWizard = async (eventsData: Partial<TimelineEventType>[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Filter out events that the user deselected in the wizard
      const eventsToAdd = eventsData.filter(event => event.title);
      
      if (eventsToAdd.length === 0) {
        toast({
          title: "No events to add",
          description: "Please select at least one event to add to your timeline.",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare events for insertion
      const eventsForInsert = eventsToAdd.map(event => ({
        user_id: session.user.id,
        title: event.title || '',
        description: event.description,
        date: event.date || new Date().toISOString().split('T')[0],
        completed: false,
        is_generated: event.is_generated || false,
        template_id: event.template_id || null,
        vendor_category: event.vendor_category || null
      }));
      
      // Insert all events
      const { data, error } = await supabase
        .from('timeline_events')
        .insert(eventsForInsert)
        .select();
        
      if (error) throw error;
      
      // Update the events state
      setEvents([...events, ...data]);
      
      toast({
        title: "Timeline generated",
        description: `Added ${data.length} events to your timeline.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding events",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleToggleComplete = async (eventId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update({ completed: !completed })
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update the events state
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return { ...event, completed: !completed };
        }
        return event;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update the events state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const filteredEvents = () => {
    switch (filter) {
      case 'upcoming':
        return events.filter(event => !event.completed);
      case 'completed':
        return events.filter(event => event.completed);
      default:
        return events;
    }
  };
  
  return (
    <div className="w-full">
      <div className={`${isMobile ? 'flex flex-col gap-4' : 'flex justify-between items-center'} mb-6`}>
        <h2 className="text-2xl font-semibold text-wedding-text">Wedding Timeline</h2>
        <div className={`${isMobile ? 'flex flex-col w-full' : 'flex'} gap-2`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
                <Filter className="h-4 w-4" />
                {filter === 'all' ? 'All Events' : 
                 filter === 'upcoming' ? 'Upcoming' : 'Completed'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isMobile ? "center" : "end"}>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('upcoming')}>
                Upcoming
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={() => setIsUsingWizard(true)}
            variant="outline"
            className={`flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 ${isMobile ? 'w-full justify-center' : ''}`}
          >
            <Wand2 className="h-4 w-4" />
            Generate Timeline
          </Button>
          
          <Button 
            onClick={() => setIsAddingEvent(true)}
            className={`bg-wedding-primary hover:bg-wedding-primary/90 ${isMobile ? 'w-full justify-center' : ''}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wedding-primary"></div>
        </div>
      ) : (
        <div className="relative mt-8">
          {/* Timeline line */}
          <div className={`absolute ${isMobile ? 'left-2' : 'left-4'} top-0 bottom-0 w-0.5 bg-gray-200`}></div>
          
          <div className={`space-y-6 ${isMobile ? 'pl-1' : ''}`}>
            {filteredEvents().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-wedding-primary/50" />
                <p className="text-lg">No events found</p>
                <p className="text-sm">Add your first wedding planning milestone</p>
              </div>
            ) : (
              filteredEvents().map(event => (
                <TimelineEvent 
                  key={event.id}
                  event={event}
                  onToggleComplete={() => handleToggleComplete(event.id, event.completed)}
                  onDelete={() => handleDeleteEvent(event.id)}
                />
              ))
            )}
          </div>
          
          {isAddingEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
                <AddEventForm 
                  onCancel={() => setIsAddingEvent(false)}
                  onAdd={handleAddEvent}
                />
              </div>
            </div>
          )}
          
          {isUsingWizard && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className={`bg-white rounded-lg p-6 ${isMobile ? 'w-full' : 'max-w-4xl w-full'} max-h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Wedding Timeline Wizard</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setIsUsingWizard(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <TimelineWizard 
                  onClose={() => setIsUsingWizard(false)}
                  onAddEvents={handleAddEventsFromWizard}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeddingTimeline;
