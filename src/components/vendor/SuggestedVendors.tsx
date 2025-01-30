import { Vendor } from "@/types/search";
import { VendorCard } from "@/components/search/VendorCard";

interface SuggestedVendorsProps {
  vendors: Vendor[];
  category: string;
  city: string;
  state: string;
}

export const SuggestedVendors = ({ vendors, category, city, state }: SuggestedVendorsProps) => {
  if (!vendors?.length) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-heading font-semibold text-wedding-text mb-6">
        More {category} in {city}, {state}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
};