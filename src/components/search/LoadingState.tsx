import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-12 h-12 animate-spin text-wedding-primary" />
      <h1 className="text-2xl md:text-3xl font-semibold text-wedding-text mt-4">
        Finding the Perfect Vendors
      </h1>
      <p className="text-gray-600 mt-2">
        We're searching for the best matches in your area...
      </p>
    </div>
  );
};