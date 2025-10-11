import React from 'react';

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center justify-center">
        <div className="loader">
          <div className="relative w-[150px] h-fit flex items-center justify-end">
            {/* Book */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 126 75" 
              className="w-full h-auto drop-shadow-[10px_10px_5px_rgba(0,0,0,0.137)]">
              <rect strokeWidth={5} stroke="#2C3E50" rx="7.5" height={70} width={121} y="2.5" x="2.5" />
              <line strokeWidth={5} stroke="#2C3E50" y2={75} x2="63.5" x1="63.5" />
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M25 20H50" />
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M101 20H76" />
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M16 30L50 30" />
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M110 30L76 30" />
            </svg>
            {/* Animated Page */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff74" viewBox="0 0 65 75" 
              className="w-1/2 h-auto absolute animate-page-flip origin-left">
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M40 20H15" />
              <path strokeLinecap="round" strokeWidth={4} stroke="#E8D4B0" d="M49 30L15 30" />
              <path strokeWidth={5} stroke="#2C3E50" d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z" />
            </svg>
          </div>
        </div>
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-heading text-wedding-primary">
            Finding Your Perfect Match
          </h2>
          <p className="text-wedding-text/80 font-body">
            We're searching through our curated list of wedding vendors...
          </p>
        </div>
      </div>
    </div>
  );
};
