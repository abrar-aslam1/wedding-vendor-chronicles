import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calendar, DollarSign, MapPin, Mail, User, Phone } from 'lucide-react';
import { SearchResult } from '@/types/search';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MultiInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVendors: SearchResult[];
  onRemoveVendor: (vendorId: string) => void;
  onClearSelection: () => void;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  city: string;
  budgetRange: string;
  notes: string;
}

const budgetRanges = [
  { value: 'under-1000', label: 'Under $1,000' },
  { value: '1000-2500', label: '$1,000 - $2,500' },
  { value: '2500-5000', label: '$2,500 - $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: '10000-25000', label: '$10,000 - $25,000' },
  { value: 'over-25000', label: 'Over $25,000' },
  { value: 'flexible', label: 'Flexible' }
];

export const MultiInquiryModal: React.FC<MultiInquiryModalProps> = ({
  isOpen,
  onClose,
  selectedVendors,
  onRemoveVendor,
  onClearSelection
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    city: '',
    budgetRange: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<InquiryFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<InquiryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    // Soft validation for notes - show hint but don't block submission
    if (!formData.notes.trim()) {
      // We'll show a hint in the UI but not block submission
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (selectedVendors.length === 0) {
      toast({
        title: "No vendors selected",
        description: "Please select at least one vendor to contact.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit an inquiry.",
          variant: "destructive",
        });
        return;
      }

      // For now, we'll store the inquiry directly in the database
      // Later, this should call the edge function when it's deployed
      const { error } = await supabase
        .from('vendor_inquiries')
        .insert({
          user_id: session.user.id,
          vendor_ids: selectedVendors.map(v => v.place_id || v.title),
          inquiry_data: formData,
          is_multi_inquiry: selectedVendors.length > 1,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'inquiry_submit', {
          vendor_slugs: selectedVendors.map(v => v.place_id || v.title.toLowerCase().replace(/\s+/g, '-')),
          multi: selectedVendors.length > 1,
          category: selectedVendors[0]?.category || 'unknown',
          city: formData.city || 'unknown'
        });
      }

      toast({
        title: "Inquiry sent successfully!",
        description: `Your inquiry has been sent to ${selectedVendors.length} vendor${selectedVendors.length > 1 ? 's' : ''}.`,
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        city: '',
        budgetRange: '',
        notes: ''
      });
      onClearSelection();
      onClose();

    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error sending inquiry",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof InquiryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Multiple Vendors
          </DialogTitle>
          <DialogDescription>
            Send your inquiry to {selectedVendors.length} vendor{selectedVendors.length > 1 ? 's' : ''} at once.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Vendors */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-700">Selected Vendors:</h3>
          <div className="space-y-2">
            {selectedVendors.map((vendor) => (
              <div
                key={vendor.place_id || vendor.title}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {vendor.main_image && (
                    <img
                      src={vendor.main_image}
                      alt={vendor.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{vendor.title}</p>
                    {vendor.address && (
                      <p className="text-xs text-gray-500">{vendor.address}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveVendor(vendor.place_id || vendor.title)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Date *
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className={errors.eventDate ? 'border-red-500' : ''}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-500">{errors.eventDate}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Event City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City, State"
              />
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budgetRange" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range
              </Label>
              <Select
                value={formData.budgetRange}
                onValueChange={(value) => handleInputChange('budgetRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes
              {!formData.notes.trim() && (
                <span className="text-sm text-amber-600 ml-2">
                  (Adding details helps vendors provide better responses)
                </span>
              )}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Tell the vendors about your event, specific requirements, or any questions you have..."
              rows={4}
              className={!formData.notes.trim() ? 'border-amber-200' : ''}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedVendors.length === 0}
              className="bg-wedding-primary hover:bg-wedding-primary/90"
            >
              {isSubmitting ? 'Sending...' : `Send to ${selectedVendors.length} Vendor${selectedVendors.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
