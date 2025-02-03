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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LocationSelects } from "@/components/search/LocationSelects";

interface Category {
  id: string;
  category: string;
  name: string;
  description: string | null;
}

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
  const [categories, setCategories] = useState<Category[]>([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('vendor_subcategories')
        .select('*');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, [toast]);

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

      if (selectedFiles.length === 0) {
        throw new Error("Please upload at least one image of your business");
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in to list your business");

      // Upload all images concurrently
      const imageUploadPromises = selectedFiles.map(file => uploadImage(file));
      const imageUrls = await Promise.all(imageUploadPromises);

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
          category: data.category,
          city: data.city,
          state: data.state,
          contact_info,
          images: imageUrls,
          owner_id: user.id,
        });

      if (insertError) {
        throw new Error(`Failed to create listing: ${insertError.message}`);
      }

      toast({
        title: "Success!",
        description: "Your business has been listed successfully.",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
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
                      key={category.id}
                      value={category.category}
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
              }}
              setSelectedCity={(city) => {
                setSelectedCity(city);
                form.setValue("city", city);
              }}
              isSearching={isSearching}
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
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Please upload at least one image of your business
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
