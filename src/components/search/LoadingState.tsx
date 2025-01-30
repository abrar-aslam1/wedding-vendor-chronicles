import React from 'react';

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="bg-[#212121] p-4 md:p-8 rounded-xl">
        <div className="text-gray-400 font-body text-2xl font-medium h-[40px] px-2.5 flex items-center">
          loading
          <div className="relative overflow-hidden ml-1.5">
            <div className="relative h-10 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-[#212121] after:via-transparent after:to-[#212121] after:z-20">
              <span className="block h-full pl-1.5 text-wedding-primary animate-spin-words">vendors</span>
              <span className="block h-full pl-1.5 text-wedding-primary animate-spin-words">venues</span>
              <span className="block h-full pl-1.5 text-wedding-primary animate-spin-words">photographers</span>
              <span className="block h-full pl-1.5 text-wedding-primary animate-spin-words">caterers</span>
              <span className="block h-full pl-1.5 text-wedding-primary animate-spin-words">vendors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};