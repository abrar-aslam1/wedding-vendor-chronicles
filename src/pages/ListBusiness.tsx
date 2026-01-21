import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LocationSelects } from "@/components/search/LocationSelects";
import { categories } from "@/config/categories";

const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  city: z.string().min(1, "Please select a city"),
  state: z.string().min(1, "Please select a state"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  website: z.union([
    z.string().url("Please enter a valid website URL"),
    z.string().length(0)
  ]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListBusiness() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      description: "",
      category: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      website: "",
    },
  });

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

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Validate location fields explicitly
      if (!data.state || !data.city) {
        toast({
          title: "Missing Information",
          description: "Please select both state and city for your business location.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (selectedFiles.length === 0) {
        toast({
          title: "Missing Images",
          description: "Please upload at least one image of your business.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in to list your business");

      // Upload images with better error handling
      const imageUrls: string[] = [];
      const failedUploads: string[] = [];
      
      for (const file of selectedFiles) {
        try {
          const url = await uploadImage(file);
          imageUrls.push(url);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          failedUploads.push(file.name);
        }
      }
      
      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `Failed to upload: ${failedUploads.join(', ')}`,
          variant: "destructive"
        });
      }
      
      if (imageUrls.length === 0) {
        throw new Error("No images were uploaded successfully");
      }

      const contact_info: Record<string, string> = {
        phone: data.phone,
        email: data.email,
      };
      
      if (data.website) {
        contact_info.website = data.website;
      }

      const { error: insertError } = await supabase
        .from('vendors')
        .insert({
          business_name: data.businessName,
          description: data.description,
          category: data.category.toLowerCase(),
          city: data.city,
          state: data.state,
          contact_info,
          images: imageUrls,
          owner_id: user.id,
          verification_status: 'pending'
        });

      if (insertError) {
        throw new Error(`Failed to create listing: ${insertError.message}`);
      }

      toast({
        title: "Success!",
        description: "Your business has been submitted for review. It will appear in search results once approved.",
      });

      navigate("/");
    } catch (error) {
      console.error('Error listing business:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to list business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateFileContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          resolve(false);
          return;
        }
        
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check magic numbers for common image formats
        const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
        const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
                     uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
        const isWebP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && 
                      uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
        
        resolve(isJPEG || isPNG || isWebP);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 12)); // Read first 12 bytes for magic number check
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 10;
    
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check MIME type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format. Please use JPEG, PNG, or WebP.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Check file size
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 5MB.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Validate actual file content (magic number check)
      const isValidContent = await validateFileContent(file);
      if (!isValidContent) {
        toast({
          title: "Invalid file content",
          description: `${file.name} appears to be corrupted or is not a valid image file.`,
          variant: "destructive"
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} images at once.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFiles(validFiles);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">List Your Business</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <Input {...form.register("businessName")} />
              {form.formState.errors.businessName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border-wedding-primary/20">
                  <SelectValue placeholder="Select your business category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.slug}
                      value={category.slug}
                    >
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-sm text-gray-500">{category.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>

            <LocationSelects
              selectedState={selectedState}
              selectedCity={selectedCity}
              setSelectedState={(state) => {
                setSelectedState(state);
                form.setValue("state", state);
                // Clear city when state changes
                setSelectedCity("");
                form.setValue("city", "");
                form.clearErrors("city");
              }}
              setSelectedCity={(city) => {
                setSelectedCity(city);
                form.setValue("city", city);
              }}
              isSearching={isSearching}
              stateError={form.formState.errors.state?.message}
              cityError={form.formState.errors.city?.message}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input {...form.register("phone")} type="tel" />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input {...form.register("email")} type="email" />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website (Optional)</label>
              <Input {...form.register("website")} type="url" />
              {form.formState.errors.website && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Images <span className="text-red-500">*</span></label>
                {selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} selected
                  </span>
                )}
              </div>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload 1-10 images (JPEG, PNG, WebP). Max 5MB each.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "List Your Business"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
