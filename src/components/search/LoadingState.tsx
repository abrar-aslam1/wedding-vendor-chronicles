import React from 'react';

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-[50px] relative mb-4">
        {/* Loading text */}
        <span className="absolute top-0 p-0 m-0 text-wedding-primary text-sm tracking-wider animate-[text_3.5s_ease_both_infinite]">
          loading
        </span>
        
        {/* Main dot */}
        <span className="block h-4 w-4 bg-wedding-primary rounded-full absolute bottom-0 animate-[loading_3.5s_ease_both_infinite]">
          {/* Before element dot */}
          <span className="absolute w-full h-full bg-wedding-secondary rounded-full animate-[loading2_3.5s_ease_both_infinite]" />
        </span>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-semibold text-wedding-text mt-4">
        Finding the Perfect Vendors
      </h1>
      <p className="text-gray-600 mt-2">
        We're searching for the best matches in your area...
      </p>
    </div>
  );
};