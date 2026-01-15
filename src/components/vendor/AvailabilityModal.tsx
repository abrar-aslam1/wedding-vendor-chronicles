import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { SearchResult } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: SearchResult;
}

interface AvailabilityFormData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  message: string;
}

export const AvailabilityModal = ({ isOpen, onClose, vendor }: AvailabilityModalProps) => {
  const [formData, setFormData] = useState<AvailabilityFormData>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'wedding',
    guestCount: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (field: keyof AvailabilityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to check availability.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert availability request into database
      const { error } = await supabase
        .from('availability_requests')
        .insert({
          user_id: session.user.id,
          vendor_place_id: vendor.place_id,
          vendor_title: vendor.title,
          vendor_phone: vendor.phone,
          vendor_email: vendor.email,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          event_date: formData.eventDate,
          event_type: formData.eventType,
          guest_count: formData.guestCount ? parseInt(formData.guestCount) : null,
          message: formData.message,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Request sent successfully!",
        description: `Your availability request has been sent to ${vendor.title}. They will contact you soon.`,
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        eventType: 'wedding',
        guestCount: '',
        message: ''
      });
      onClose();

    } catch (error) {
      console.error('Error submitting availability request:', error);
      toast({
        title: "Error sending request",
        description: "There was a problem sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-wedding-primary" />
            Check Availability
          </DialogTitle>
          <DialogDescription>
            Send an availability request to <strong>{vendor.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="guestCount">Expected Guest Count</Label>
              <Input
                id="guestCount"
                type="number"
                value={formData.guestCount}
                onChange={(e) => handleInputChange('guestCount', e.target.value)}
                placeholder="e.g., 100"
                min="1"
              />
            </div>
          </div>

          {/* Additional Message */}
          <div>
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Additional Details
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us more about your event, specific requirements, or questions..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-wedding-primary hover:bg-wedding-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
