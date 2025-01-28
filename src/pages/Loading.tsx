import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-wedding-primary via-wedding-secondary to-[#ffd1dc]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-white" />
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Finding the Perfect Vendors
        </h1>
        <p className="text-white/80">
          We're searching for the best matches in your area...
        </p>
      </div>
    </div>
  );
};

export default Loading;