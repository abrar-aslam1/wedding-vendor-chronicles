import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Upload, X, CheckCircle, Crown, Bell, Sparkles, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Vendor } from '@/integrations/supabase/types';
import { categories } from '@/config/categories';
import { getSubcategoriesForCategory } from '@/config/subcategories';
import { LocationSelects } from '@/components/search/LocationSelects';

interface VendorProfileEditorProps {
  vendorId: string;
  vendor: Vendor;
  tier: 'free' | 'professional' | 'premium';
  onSaved?: () => void;
  onUpgradeClick?: () => void;
}

export const VendorProfileEditor: React.FC<VendorProfileEditorProps> = ({
  vendorId,
  vendor,
  tier,
  onSaved,
  onUpgradeClick,
}) => {
  const isPaid = tier === 'professional' || tier === 'premium';
  const isPremium = tier === 'premium';
  const contactInfo = (vendor.contact_info as Record<string, string>) || {};

  // Form state
  const [businessName, setBusinessName] = useState(vendor.business_name || '');
  const [description, setDescription] = useState(vendor.description || '');
  const [category, setCategory] = useState(vendor.category || '');
  const [subcategory, setSubcategory] = useState(contactInfo.subcategory || '');
  const [selectedState, setSelectedState] = useState(vendor.state || '');
  const [selectedCity, setSelectedCity] = useState(vendor.city || '');
  const [phone, setPhone] = useState(contactInfo.phone || '');
  const [email, setEmail] = useState(contactInfo.email || '');
  const [website, setWebsite] = useState(contactInfo.website || '');
  const [instagram, setInstagram] = useState(contactInfo.instagram || '');
  const [facebook, setFacebook] = useState(contactInfo.facebook || '');
  const [tiktok, setTiktok] = useState(contactInfo.tiktok || '');
  const [tagline, setTagline] = useState(contactInfo.tagline || '');
  const [leadNotifications, setLeadNotifications] = useState(
    contactInfo.lead_notifications === 'true'
  );
  const [existingImages, setExistingImages] = useState<string[]>(vendor.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<Array<{ name: string; slug: string; description?: string }>>([]);

  // Load subcategories when category changes
  useEffect(() => {
    if (category) {
      const subcats = getSubcategoriesForCategory(category);
      setAvailableSubcategories(subcats);
    }
  }, [category]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `vendor_${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `vendors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('vendor-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const totalAllowed = 10 - existingImages.length;

    const validFiles: File[] = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > totalAllowed) {
      toast.error(`You can only have up to 10 images total. You can add ${totalAllowed} more.`);
      return;
    }

    setNewFiles(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Basic validation
    if (!businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!instagram.trim()) {
      toast.error('Instagram handle is required');
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of newFiles) {
        const url = await uploadImage(file);
        newImageUrls.push(url);
      }

      const allImages = [...existingImages, ...newImageUrls];

      if (allImages.length === 0) {
        toast.error('At least one image is required');
        setSaving(false);
        return;
      }

      // Build contact_info
      const updatedContactInfo: Record<string, string> = {
        phone,
        email,
        instagram,
      };
      if (website) updatedContactInfo.website = website;
      if (facebook) updatedContactInfo.facebook = facebook;
      if (tiktok) updatedContactInfo.tiktok = tiktok;
      if (subcategory && subcategory !== 'none') updatedContactInfo.subcategory = subcategory;
      // Paid features (only persisted if vendor has the right tier)
      if (isPaid && tagline) updatedContactInfo.tagline = tagline.slice(0, 80);
      if (isPremium) updatedContactInfo.lead_notifications = leadNotifications ? 'true' : 'false';

      // Update vendor record
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: businessName.trim(),
          description: description.trim(),
          category: category.toLowerCase(),
          city: selectedCity,
          state: selectedState,
          contact_info: updatedContactInfo,
          images: allImages,
        })
        .eq('id', vendorId);

      if (error) throw error;

      setNewFiles([]);
      setExistingImages(allImages);
      setSaved(true);
      toast.success('Profile updated successfully!');
      onSaved?.();

      // Reset saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Update your core business information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business and services..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length} characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setSubcategory('');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && availableSubcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <Select
                value={subcategory || 'none'}
                onValueChange={(value) => setSubcategory(value === 'none' ? '' : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No subcategory</SelectItem>
                  {availableSubcategories.map((subcat) => (
                    <SelectItem key={subcat.slug} value={subcat.slug}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationSelects
              selectedState={selectedState}
              selectedCity={selectedCity}
              setSelectedState={(state) => {
                setSelectedState(state);
                setSelectedCity('');
              }}
              setSelectedCity={setSelectedCity}
              isSearching={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How couples can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="hello@yourbusiness.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website <span className="text-gray-500 text-xs">(Optional)</span></label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
              placeholder="https://yourbusiness.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Connect your social profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Instagram Handle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="pl-8"
                placeholder="yourbusiness"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook <span className="text-gray-500 text-xs">(Optional)</span></label>
              <Input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TikTok <span className="text-gray-500 text-xs">(Optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <Input
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="pl-8"
                  placeholder="yourbusiness"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className={isPaid ? 'border-wedding-primary/30' : 'border-gray-200 bg-gray-50/50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-wedding-primary" />
              <CardTitle>Premium Features</CardTitle>
            </div>
            {!isPaid && (
              <Button size="sm" variant="outline" onClick={onUpgradeClick}>
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
          <CardDescription>
            {isPaid
              ? 'Make your listing stand out with these premium features'
              : 'Upgrade to Professional or Premium to unlock these features'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Custom Tagline - Pro+ */}
          <div className={!isPaid ? 'opacity-60' : ''}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">
                Custom Tagline
                {!isPaid && <Lock className="w-3 h-3 inline ml-1.5 text-gray-400" />}
              </label>
              <span className="text-xs text-gray-500">{tagline.length}/80</span>
            </div>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value.slice(0, 80))}
              placeholder="e.g., Award-winning South Asian wedding photographer"
              disabled={!isPaid}
              maxLength={80}
            />
            <p className="text-xs text-gray-500 mt-1">
              A short pitch shown on your vendor card and detail page
            </p>
          </div>

          {/* Lead Notifications - Premium only */}
          <div className={!isPremium ? 'opacity-60' : ''}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-medium">
                    Instant Lead Notifications
                    {!isPremium && (
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Get an email the moment a couple reveals your phone, clicks email, or visits your website
                </p>
              </div>
              <Switch
                checked={leadNotifications}
                onCheckedChange={setLeadNotifications}
                disabled={!isPremium}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Showcase your work ({existingImages.length + newFiles.length}/10 images)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingImages.map((url, index) => (
                <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Business photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New files preview */}
          {newFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">New uploads (unsaved)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {newFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-blue-300 bg-blue-50">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-1 left-1 bg-blue-500 text-xs">New</Badge>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          {existingImages.length + newFiles.length < 10 && (
            <div>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Add photos</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP. Max 5MB each.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
