import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showWordmark = true, 
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Bespoke Geometric Emblem */}
      <div className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center`}>
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full drop-shadow-sm transition-transform hover:scale-105 duration-200"
        >
          {/* Base rounded background tile */}
          <rect width="40" height="40" rx="12" fill="#0E0E10" />
          
          {/* Flowing Narrative Wave + Analytical Chart Prism */}
          {/* Left Vertical Pillar */}
          <path 
            d="M12 28V14C12 12.8954 12.8954 12 14 12C15.1046 12 16 12.8954 16 14V28C16 29.1046 15.1046 30 14 30C12.8954 30 12 29.1046 12 28Z" 
            fill="#FAF4ED" 
          />
          
          {/* Dynamic Ascending Diagonal Ribbon */}
          <path 
            d="M14.5 13.5L25.5 26.5" 
            stroke="#FF7448" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />

          {/* Right Vertical Pillar */}
          <path 
            d="M24 26V16C24 14.8954 24.8954 14 26 14C27.1046 14 28 14.8954 28 16V26C28 27.1046 27.1046 28 26 28C24.8954 28 24 27.1046 24 26Z" 
            fill="#FAF4ED" 
          />

          {/* Apex Vector Node (The Intelligence Spark) */}
          <circle cx="26" cy="12" r="3" fill="#FF7448" />
        </svg>
      </div>

      {/* Artisanal Typographic Wordmark */}
      {showWordmark && (
        <span className={`font-black tracking-tight text-[#0E0E10] leading-none ${textSizes[size]}`}>
          narrative<span className="text-[#FF7448]">.</span>
        </span>
      )}
    </div>
  );
};
