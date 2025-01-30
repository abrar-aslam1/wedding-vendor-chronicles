import { MapPin, Clock, Phone, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Vendor } from "@/types/search";

interface VendorBusinessDetailsProps {
  vendor: Vendor;
}

export const VendorBusinessDetails = ({ vendor }: VendorBusinessDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-heading font-semibold text-wedding-text mb-4">
        Business Details
      </h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-wedding-primary mt-1" />
          <div>
            <h3 className="font-semibold text-wedding-text">Location</h3>
            <p className="text-wedding-text">
              {vendor.address}, {vendor.city}, {vendor.state} {vendor.postal_code}
            </p>
          </div>
        </div>
        {vendor.business_hours && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-wedding-primary mt-1" />
              <div>
                <h3 className="font-semibold text-wedding-text">Business Hours</h3>
                <p className="text-wedding-text whitespace-pre-line">
                  {vendor.business_hours}
                </p>
              </div>
            </div>
          </>
        )}
        {vendor.phone && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-wedding-primary mt-1" />
              <div>
                <h3 className="font-semibold text-wedding-text">Phone</h3>
                <p className="text-wedding-text">{vendor.phone}</p>
              </div>
            </div>
          </>
        )}
        {vendor.website && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-wedding-primary mt-1" />
              <div>
                <h3 className="font-semibold text-wedding-text">Website</h3>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wedding-primary hover:text-wedding-accent"
                >
                  {vendor.website}
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};