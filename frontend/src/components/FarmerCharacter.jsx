import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FARMER_PROFILES } from '../cropTranslations';

/**
 * 2D Animated Agricultural Characters for AgriSmart AI.
 * Characters:
 *  1. 'ramesh' (Farmer Ramesh - Experienced Agronomist with Straw Hat & Sprout)
 *  2. 'priya'  (Dr. Priya - Modern Agri-Data Scientist with Glasses & Tablet)
 *  3. 'arjun'  (Arjun - Tech-Savvy Agripreneur with Cap & Smart Sensor)
 *  4. 'tara'   (Tara - Organic Specialist with Sunhat & Golden Wheat)
 *
 * All characters have their hands moving CONTINUOUSLY in a natural, cheerful "Hi!" waving gesture!
 */
export default function FarmerCharacter({
  character = 'ramesh', // 'ramesh' | 'priya' | 'arjun' | 'tara'
  pose = 'welcoming',    // 'welcoming' | 'scientist' | 'celebrating' | 'peeking'
  message = null,
  size = 'md',          // 'sm' | 'md' | 'lg' | 'xl'
  showContinuousWave = true,
  showSpeechBubble = true,
  className = ''
}) {
  const [showBubble, setShowBubble] = useState(showSpeechBubble && message !== false);
  const { language = 'en' } = useApp() || {};
  const currentLang = ['en', 'hi', 'pa', 'mr', 'te', 'ta', 'bn', 'gu'].includes(language) ? language : 'en';

  // Default character names & messages
  const characterProfiles = {
    ramesh: {
      name: "Farmer Ramesh",
      role: "Lead Agronomist",
      badge: "Traditional Wisdom",
      defaultMsg: "Namaste! I've spent 25+ years in the fields. Let's find your ideal crop match!"
    },
    priya: {
      name: "Dr. Priya",
      role: "Agricultural AI Scientist",
      badge: "Neural Model Lead",
      defaultMsg: "Hello! Our 97.5% accurate neural network calculates optimal nutrient balance for you."
    },
    arjun: {
      name: "Arjun",
      role: "Precision Tech Specialist",
      badge: "Field Analytics",
      defaultMsg: "Hey! Real-time soil telemetry and rainfall metrics give you maximum harvest yield!"
    },
    tara: {
      name: "Tara",
      role: "Botanical Plant Nutritionist",
      badge: "Soil Bio-Chemistry",
      defaultMsg: "Hi there! Maintaining proper soil pH and NPK ratios protects biodiversity!"
    }
  };

  const profile = characterProfiles[character] || characterProfiles.ramesh;
  const localizedName = FARMER_PROFILES[character]?.name?.[currentLang] || profile.name;
  const localizedRole = FARMER_PROFILES[character]?.role?.[currentLang] || profile.role;
  const currentMessage = message || profile.defaultMsg;

  // Sizes
  const sizeMap = {
    sm: { width: 125, height: 145 },
    md: { width: 165, height: 195 },
    lg: { width: 220, height: 260 },
    xl: { width: 280, height: 330 }
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      
      {/* Dynamic Speech Bubble */}
      {showBubble && currentMessage && (
        <div 
          className="relative mb-3 max-w-xs px-3.5 py-2.5 rounded-2xl bg-white text-forest-950 border-2 border-agri-400 shadow-xl text-xs font-semibold leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 z-20 cursor-pointer hover:border-agri-600 transition-colors"
          onClick={() => setShowBubble(!showBubble)}
          title="Click to dismiss tip"
        >
          <div className="flex items-start gap-2">
            <span className="text-agri-600 text-sm">👋</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700 block">
                {localizedName} • {localizedRole}
              </span>
              <p className="mt-0.5 text-slate-700">{currentMessage}</p>
            </div>
          </div>
          {/* Speech bubble tail pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-agri-400 rotate-45" />
        </div>
      )}

      {/* 2D Vector Character SVG */}
      <div 
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => showSpeechBubble && setShowBubble(!showBubble)}
        title={`${profile.name} is waving 'Hi!'`}
      >
        <svg
          width={dim.width}
          height={dim.height}
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible filter drop-shadow-md"
        >
          {/* Subtle Ground Shadow */}
          <ellipse cx="100" cy="232" rx="65" ry="8" fill="#143D28" fillOpacity="0.18" />

          {/* Group: Animated Torso Breathing / Bobbing */}
          <g className="animate-float-slow" style={{ transformOrigin: '100px 180px' }}>
            
            {/* ========================================================
                BODY & CLOTHES PER CHARACTER
               ======================================================== */}
            {character === 'ramesh' && (
              // Farmer Ramesh: Green Overalls & Plaid Shirt
              <g>
                <path d="M70 145 C65 170 65 210 68 230 L132 230 C135 210 135 170 130 145 Z" fill="#235D23" />
                <path d="M62 135 C60 150 72 170 100 170 C128 170 140 150 138 135 Z" fill="#EBE2D5" />
                <path d="M75 140 L100 165 L125 140" stroke="#8C6D46" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M78 145 L82 195" stroke="#1B4A1B" strokeWidth="9" strokeLinecap="round" />
                <path d="M122 145 L118 195" stroke="#1B4A1B" strokeWidth="9" strokeLinecap="round" />
                <circle cx="82" cy="180" r="3.5" fill="#F59E0B" />
                <circle cx="118" cy="180" r="3.5" fill="#F59E0B" />
                <rect x="88" y="185" width="24" height="20" rx="3" fill="#1B4A1B" fillOpacity="0.8" />
                <path d="M93 182 L100 188 L107 182 Z" fill="#FDE68A" />
              </g>
            )}

            {character === 'priya' && (
              // Dr. Priya: Smart Lab Coat / Teal Scientist Vest
              <g>
                <path d="M68 145 C64 170 64 210 68 230 L132 230 C136 210 136 170 132 145 Z" fill="#0D9488" />
                <path d="M62 135 C60 150 72 170 100 170 C128 170 140 150 138 135 Z" fill="#FFFFFF" />
                <path d="M80 145 L80 230 M120 145 L120 230" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
                {/* Identification Lanyard Badge */}
                <path d="M92 138 L100 165 L108 138" stroke="#0284C7" strokeWidth="2" fill="none" />
                <rect x="94" y="165" width="12" height="15" rx="2" fill="#F8FAFC" stroke="#0284C7" strokeWidth="1" />
                <rect x="96" y="167" width="8" height="4" fill="#0284C7" />
              </g>
            )}

            {character === 'arjun' && (
              // Arjun: Modern Denim Jacket & Tech Vest
              <g>
                <path d="M68 145 C64 170 64 210 68 230 L132 230 C136 210 136 170 132 145 Z" fill="#1E3A8A" />
                <path d="M62 135 C60 150 72 170 100 170 C128 170 140 150 138 135 Z" fill="#F87171" />
                <path d="M78 145 L80 230 M122 145 L120 230" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
                {/* Tech Zipper & utility pockets */}
                <path d="M100 145 L100 230" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="80" y="180" width="16" height="18" rx="3" fill="#1E40AF" />
                <rect x="104" y="180" width="16" height="18" rx="3" fill="#1E40AF" />
              </g>
            )}

            {character === 'tara' && (
              // Tara: Floral Terracotta Apron & Fresh Green Top
              <g>
                <path d="M68 145 C64 170 64 210 68 230 L132 230 C136 210 136 170 132 145 Z" fill="#C2410C" />
                <path d="M62 135 C60 150 72 170 100 170 C128 170 140 150 138 135 Z" fill="#15803D" />
                <path d="M80 145 L82 195" stroke="#9A3412" strokeWidth="8" strokeLinecap="round" />
                <path d="M120 145 L118 195" stroke="#9A3412" strokeWidth="8" strokeLinecap="round" />
                <rect x="84" y="180" width="32" height="24" rx="4" fill="#9A3412" />
                <circle cx="100" cy="192" r="4" fill="#FBBF24" />
              </g>
            )}

            {/* ========================================================
                LEFT HAND TOOL / PLANT ACCESSORY
               ======================================================== */}
            <g>
              {/* Left Arm Base */}
              <path
                d="M66 142 C50 155 45 180 52 198 C56 206 65 208 72 200 C74 196 68 185 68 170"
                fill={character === 'priya' ? '#0D9488' : character === 'arjun' ? '#1E3A8A' : character === 'tara' ? '#C2410C' : '#235D23'}
              />
              {/* Hand */}
              <circle cx="56" cy="202" r="8" fill="#FCD34D" />

              {/* Unique Tool in Left Hand */}
              {character === 'priya' && (
                // Digital Tablet / Diagnostic Chart
                <g className="animate-pulse">
                  <rect x="42" y="184" width="22" height="30" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="45" y="188" width="16" height="20" rx="2" fill="#0369A1" />
                  <circle cx="53" cy="211" r="2" fill="#38BDF8" />
                </g>
              )}

              {character === 'arjun' && (
                // Drone Remote Controller / Smart Sensor
                <g className="animate-pulse">
                  <rect x="43" y="188" width="22" height="22" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
                  <circle cx="49" cy="199" r="2.5" fill="#10B981" />
                  <circle cx="59" cy="199" r="2.5" fill="#10B981" />
                  <line x1="54" y1="188" x2="54" y2="182" stroke="#64748B" strokeWidth="2" />
                </g>
              )}

              {character === 'tara' && (
                // Golden Wheat Sheaf / Sunflower
                <g className="animate-pulse">
                  <path d="M56 200 Q54 180 48 170" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="48" cy="170" rx="6" ry="10" fill="#F59E0B" />
                  <ellipse cx="54" cy="174" rx="5" ry="8" fill="#FCD34D" />
                </g>
              )}

              {character === 'ramesh' && (
                // Sprouting Seedling in Clay Pot
                <g className="animate-pulse">
                  <path d="M48 200 L64 200 L61 214 L51 214 Z" fill="#5A4226" />
                  <path d="M56 200 Q56 186 52 180" stroke="#3D933D" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M52 180 Q42 178 46 187 Q50 188 52 180 Z" fill="#22C55E" />
                  <path d="M52 183 Q62 178 60 188 Q55 189 52 183 Z" fill="#4ADE80" />
                </g>
              )}
            </g>

            {/* ========================================================
                RIGHT ARM: CONTINUOUS "HI!" WAVING GESTURE
               ======================================================== */}
            <g 
              className={showContinuousWave ? "animate-arm-wave-continuous" : ""}
              style={{ transformOrigin: '142px 145px' }}
            >
              {/* Upper & Forearm */}
              <path
                d="M134 142 C150 146 164 135 174 116 C177 110 171 105 164 109 C154 122 145 132 135 152"
                fill={character === 'priya' ? '#0D9488' : character === 'arjun' ? '#1E3A8A' : character === 'tara' ? '#C2410C' : '#235D23'}
              />

              {/* Hand with Continuous "Hi" Waving Pivot */}
              <g 
                className={showContinuousWave ? "animate-hand-wave-continuous" : ""}
                style={{ transformOrigin: '174px 114px' }}
              >
                {/* Palm */}
                <circle cx="174" cy="114" r="9" fill="#FCD34D" />
                
                {/* Thumb */}
                <rect x="165" y="112" width="4" height="6" rx="2" fill="#FCD34D" transform="rotate(-30 165 112)" />

                {/* 4 Open Waving Fingers in "Hi" gesture */}
                <rect x="170" y="100" width="3.2" height="8" rx="1.6" fill="#FCD34D" />
                <rect x="175" y="98" width="3.4" height="9.5" rx="1.7" fill="#FCD34D" />
                <rect x="180" y="100" width="3.2" height="8.5" rx="1.6" fill="#FCD34D" />
                <rect x="185" y="103" width="3" height="6.5" rx="1.5" fill="#FCD34D" />

                {/* Motion Lines for continuous wave */}
                <path d="M192 100 Q196 106 193 112" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M196 96 Q201 106 197 116" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
              </g>
            </g>

            {/* Neck */}
            <rect x="94" y="118" width="12" height="14" rx="3" fill="#FBBF24" />

            {/* Head Base */}
            <circle cx="100" cy="100" r="24" fill="#FCD34D" />

            {/* Ears */}
            <circle cx="76" cy="100" r="5" fill="#FBBF24" />
            <circle cx="124" cy="100" r="5" fill="#FBBF24" />

            {/* Character Specific Hairstyles & Hats */}
            {character === 'ramesh' && (
              // Traditional Straw Hat
              <g>
                <path d="M80 84 C80 62 120 62 120 84 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                <path d="M80 81 Q100 84 120 81 L120 85 Q100 88 80 85 Z" fill="#16A34A" />
                <path d="M115 80 Q122 72 124 77 Q120 83 115 80 Z" fill="#4ADE80" />
                <ellipse cx="100" cy="85" rx="42" ry="9" fill="#FCD34D" stroke="#B45309" strokeWidth="1.8" />
              </g>
            )}

            {character === 'priya' && (
              // Professional Bun / Ponytail & Scientist Glasses
              <g>
                {/* Hair */}
                <path d="M78 100 C74 76 126 76 122 100 C116 80 84 80 78 100 Z" fill="#1E293B" />
                <circle cx="100" cy="74" r="10" fill="#1E293B" />
                <rect x="97" y="78" width="6" height="4" fill="#0D9488" rx="1" />
                {/* Smart Glasses */}
                <rect x="85" y="94" width="12" height="9" rx="2" fill="none" stroke="#0284C7" strokeWidth="2" />
                <rect x="103" y="94" width="12" height="9" rx="2" fill="none" stroke="#0284C7" strokeWidth="2" />
                <line x1="97" y1="98" x2="103" y2="98" stroke="#0284C7" strokeWidth="2" />
              </g>
            )}

            {character === 'arjun' && (
              // Modern Baseball Cap
              <g>
                {/* Hair */}
                <path d="M78 98 C76 80 124 80 122 98 Z" fill="#334155" />
                {/* Cap */}
                <path d="M80 92 C80 72 120 72 120 92 Z" fill="#1D4ED8" />
                {/* Cap Visor */}
                <path d="M105 88 Q135 84 140 92 Q120 95 105 88 Z" fill="#1E40AF" />
                <circle cx="100" cy="74" r="3" fill="#FFFFFF" />
              </g>
            )}

            {character === 'tara' && (
              // Floral Sunhat with Ribbon
              <g>
                {/* Wavy Hair */}
                <path d="M76 96 C70 120 74 130 78 135 M124 96 C130 120 126 130 122 135" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
                {/* Sunhat */}
                <ellipse cx="100" cy="85" rx="38" ry="10" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
                <path d="M82 85 C82 68 118 68 118 85 Z" fill="#FDE047" />
                <path d="M82 83 Q100 86 118 83 L118 86 Q100 89 82 86 Z" fill="#E11D48" />
                <circle cx="114" cy="84" r="3" fill="#FFFFFF" />
              </g>
            )}

            {/* Smiling Eyes */}
            <g>
              <ellipse cx="91" cy="98" rx="2.8" ry="3.2" fill="#0F2F1F" />
              <circle cx="92" cy="97" r="1" fill="#FFFFFF" />
              <ellipse cx="109" cy="98" rx="2.8" ry="3.2" fill="#0F2F1F" />
              <circle cx="110" cy="97" r="1" fill="#FFFFFF" />
              <path d="M87 92 Q91 89 95 91" stroke="#8C6D46" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M105 91 Q109 89 113 92" stroke="#8C6D46" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Rosy Cheeks */}
            <circle cx="86" cy="104" r="4" fill="#F87171" fillOpacity="0.45" />
            <circle cx="114" cy="104" r="4" fill="#F87171" fillOpacity="0.45" />

            {/* Cheerful Smile */}
            <path
              d="M93 107 Q100 115 107 107"
              stroke="#0F2F1F"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M96 108 Q100 111 104 108" fill="#FFFFFF" />

            {/* Scarf for Ramesh, Collar for others */}
            {character === 'ramesh' ? (
              <path d="M92 122 L100 134 L108 122 Q100 126 92 122 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            ) : (
              <path d="M90 122 L100 130 L110 122 Z" fill="#F8FAFC" />
            )}

          </g>
        </svg>
      </div>

    </div>
  );
}
