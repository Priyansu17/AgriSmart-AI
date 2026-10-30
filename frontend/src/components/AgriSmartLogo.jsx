import React from 'react';

/**
 * Custom handcrafted logo emblem for AgriSmart AI.
 * Represents precision agricultural intelligence: intertwined biometric leaves,
 * growth trajectory arc, and neural seed node with rich multi-depth gradients.
 */
export default function AgriSmartLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: { box: 'w-9 h-9', icon: 24 },
    md: { box: 'w-11 h-11', icon: 30 },
    lg: { box: 'w-14 h-14', icon: 38 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-forest-900 via-agri-700 to-forest-950 p-[1.5px] shadow-md shadow-forest-950/20 group-hover:shadow-agri-600/30 group-hover:scale-105 transition-all duration-300 flex-shrink-0 ${currentSize.box} ${className}`}
    >
      {/* Subtle inner glass background container */}
      <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-forest-950 via-forest-900 to-agri-900 flex items-center justify-center overflow-hidden relative">
        {/* Soft top-right ambient light flare */}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-400/30 blur-sm pointer-events-none" />

        {/* Handcrafted Vector SVG Emblem */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[72%] h-[72%] drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Main leaf gradient: Deep Emerald to Vibrant Jade */}
            <linearGradient id="mainLeafGrad" x1="12" y1="38" x2="36" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Overlapping secondary leaf: Sunlit Lime & Golden Amber */}
            <linearGradient id="sunLeafGrad" x1="20" y1="36" x2="40" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>

            {/* Stem & neural connection curve */}
            <linearGradient id="stemGrad" x1="14" y1="40" x2="26" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            {/* Core neural dewdrop node */}
            <radialGradient id="dewNode" cx="24" cy="22" r="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#10B981" />
            </radialGradient>
          </defs>

          {/* Precision Earth Horizon Arc */}
          <path
            d="M8 40C14 37 20 36 28 36.5C36 37 40 38.5 42 40"
            stroke="#059669"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Primary Main Leaf (Left / Core curve forming organic 'A') */}
          <path
            d="M16 38C15 30 18 20 25 14C27.5 11.8 31 10 33 10C33 13 32.5 17 29.5 21C26.5 25 21 31 16 38Z"
            fill="url(#mainLeafGrad)"
          />

          {/* Secondary Overlapping Sun Leaf (Right / Outward growth gesture) */}
          <path
            d="M23 27C27 22 34 16 40 17C40 21 37 28 32 32C28 35.2 24 36 21 36.5C22.2 33 22.8 30 23 27Z"
            fill="url(#sunLeafGrad)"
            fillOpacity="0.95"
          />

          {/* Growth Stem & Intelligence Trajectory Line */}
          <path
            d="M14 41C15.5 35 19 28 24 22C28 17 33 11 34 8"
            stroke="url(#stemGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Neural Precision Node / Dewdrop at apex junction */}
          <circle
            cx="24"
            cy="22"
            r="2.5"
            fill="url(#dewNode)"
          />
          <circle
            cx="24"
            cy="22"
            r="1"
            fill="#FFFFFF"
          />

          {/* Tiny companion growth spark */}
          <circle
            cx="35"
            cy="8"
            r="1.25"
            fill="#FDE047"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}
