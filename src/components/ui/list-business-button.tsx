import React from 'react';

export const ListBusinessButton = () => {
  return (
    <button className="relative inline-block cursor-pointer outline-none border-0 align-middle no-underline font-body text-sm font-semibold text-[#382b22] uppercase px-8 py-5 bg-[#fff0f0] border-2 border-[#b18597] rounded-xl transform-gpu transition-all duration-150 ease-[cubic-bezier(0,0,0.58,1)] hover:bg-[#ffe9e9] hover:translate-y-1 active:translate-y-3 active:bg-[#ffe9e9] before:content-[''] before:absolute before:w-full before:h-full before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[#f9c4d2] before:rounded-xl before:shadow-[0_0_0_2px_#b18597,0_0.625em_0_0_#ffe3e2] before:-z-10 before:transform before:translate-z-[-1em] before:translate-y-3 before:transition-all before:duration-150 before:ease-[cubic-bezier(0,0,0.58,1)] hover:before:translate-y-2 hover:before:shadow-[0_0_0_2px_#b18597,0_0.5em_0_0_#ffe3e2] active:before:shadow-[0_0_0_2px_#b18597,0_0_#ffe3e2] active:before:translate-y-0">
      List Your Business
    </button>
  );
};