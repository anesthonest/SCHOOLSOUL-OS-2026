import React from 'react';

export interface SchoolSoulLogoProps {
  variant?: 'full' | 'mark' | 'horizontal' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  tagline?: string;
  animate?: boolean;
}

const sizeMap = {
  xs: { width: 24, height: 24, textSize: 'text-xs', markSize: 24 },
  sm: { width: 36, height: 36, textSize: 'text-sm', markSize: 36 },
  md: { width: 48, height: 48, textSize: 'text-base', markSize: 48 },
  lg: { width: 72, height: 72, textSize: 'text-xl', markSize: 72 },
  xl: { width: 120, height: 120, textSize: 'text-2xl', markSize: 120 },
  '2xl': { width: 180, height: 180, textSize: 'text-3xl', markSize: 180 },
};

/**
 * Pure SVG vector mark of the official SchoolSoul emblem:
 * Radiant sunburst, glowing golden heart, and royal navy book-wings.
 */
export const SchoolSoulMarkSVG: React.FC<{
  size?: number;
  className?: string;
  idPrefix?: string;
}> = ({ size = 48, className = '', idPrefix = 'ss-logo' }) => {
  const gradIdSun = `${idPrefix}-sun-grad`;
  const gradIdHeart = `${idPrefix}-heart-grad`;
  const gradIdHeartGlow = `${idPrefix}-heart-glow`;
  const gradIdGoldWing = `${idPrefix}-gold-wing`;
  const gradIdNavyWing = `${idPrefix}-navy-wing`;

  return (
    <svg
      viewBox="0 0 300 240"
      width={size}
      height={(size * 240) / 300}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SchoolSoul Emblem"
    >
      <defs>
        {/* Sunbeam / Ray Gradient */}
        <linearGradient id={gradIdSun} x1="150" y1="20" x2="150" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5B731" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#E29E20" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F3C658" stopOpacity="0" />
        </linearGradient>

        {/* Heart Inner Radial Glow */}
        <radialGradient id={gradIdHeartGlow} cx="150" cy="100" r="50" fx="150" fy="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="1" />
          <stop offset="35%" stopColor="#FEE69C" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#F6B834" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#D98A1B" stopOpacity="0.3" />
        </radialGradient>

        {/* Heart Outline Gradient */}
        <linearGradient id={gradIdHeart} x1="100" y1="65" x2="200" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD872" />
          <stop offset="50%" stopColor="#E39F24" />
          <stop offset="100%" stopColor="#BF7D12" />
        </linearGradient>

        {/* Gold Ribbon / Inner Wing Accent */}
        <linearGradient id={gradIdGoldWing} x1="60" y1="120" x2="240" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCDA7C" />
          <stop offset="50%" stopColor="#DF9C22" />
          <stop offset="100%" stopColor="#C98416" />
        </linearGradient>

        {/* Deep Royal Navy Wing */}
        <linearGradient id={gradIdNavyWing} x1="80" y1="100" x2="220" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0E2757" />
          <stop offset="100%" stopColor="#081A3C" />
        </linearGradient>
      </defs>

      {/* 1. RADIANT SUNBEAMS / LIGHT RAYS */}
      <g stroke={`url(#${gradIdSun})`} strokeWidth="1.75" strokeLinecap="round" opacity="0.9">
        {/* Center Vertical */}
        <line x1="150" y1="12" x2="150" y2="52" />
        {/* Left fan rays */}
        <line x1="138" y1="15" x2="144" y2="54" />
        <line x1="126" y1="20" x2="138" y2="57" />
        <line x1="114" y1="27" x2="132" y2="62" />
        <line x1="103" y1="36" x2="127" y2="67" />
        <line x1="93" y1="47" x2="123" y2="74" />
        <line x1="84" y1="60" x2="119" y2="82" />
        <line x1="77" y1="75" x2="116" y2="91" />
        {/* Right fan rays */}
        <line x1="162" y1="15" x2="156" y2="54" />
        <line x1="174" y1="20" x2="162" y2="57" />
        <line x1="186" y1="27" x2="168" y2="62" />
        <line x1="197" y1="36" x2="173" y2="67" />
        <line x1="207" y1="47" x2="177" y2="74" />
        <line x1="216" y1="60" x2="181" y2="82" />
        <line x1="223" y1="75" x2="184" y2="91" />
      </g>

      {/* 2. APEX DIAMOND GEM */}
      <path
        d="M150 56 L154 65 L150 74 L146 65 Z"
        fill={`url(#${gradIdHeart})`}
        stroke="#FFFFFF"
        strokeWidth="0.5"
      />

      {/* 3. RADIANT GLOWING HEART (INNER) */}
      <path
        d="M150 78 C162 60 196 62 196 92 C196 116 166 142 150 158 C134 142 104 116 104 92 C104 62 138 60 150 78 Z"
        fill={`url(#${gradIdHeartGlow})`}
      />

      {/* 4. HEART GLOW ACCENT CORE (SOFT LUMINANCE) */}
      <circle cx="150" cy="100" r="16" fill="#FFFDF0" opacity="0.85" filter="blur(2px)" />

      {/* 5. GOLDEN HEART CONTOUR RIBBON */}
      <path
        d="M150 78 C163 60 197 63 197 93 C197 118 167 144 150 160 C133 144 103 118 103 93 C103 63 137 60 150 78 Z"
        stroke={`url(#${gradIdHeart})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 6. WINGS / OPEN BOOK PAGES (OUTER UPPER NAVY WINGS) */}
      {/* Left Wing Outer Tip */}
      <path
        d="M74 80 C84 106 105 138 150 166 C115 142 85 110 74 80 Z"
        fill={`url(#${gradIdNavyWing})`}
      />
      {/* Right Wing Outer Tip */}
      <path
        d="M226 80 C216 106 195 138 150 166 C185 142 215 110 226 80 Z"
        fill={`url(#${gradIdNavyWing})`}
      />

      {/* Middle Navy Layer Wing / Book Page */}
      <path
        d="M60 98 C72 124 98 156 150 178 C110 154 78 126 60 98 Z"
        fill={`url(#${gradIdNavyWing})`}
      />
      <path
        d="M240 98 C228 124 202 156 150 178 C190 154 222 126 240 98 Z"
        fill={`url(#${gradIdNavyWing})`}
      />

      {/* 7. GOLDEN EMBLEMATIC INNER ACCENT FLOURISH (LOWER RIBBON) */}
      <path
        d="M59 116 C78 140 108 170 150 188 C115 166 84 140 59 116 Z"
        fill={`url(#${gradIdGoldWing})`}
      />
      <path
        d="M241 116 C222 140 192 170 150 188 C185 166 216 140 241 116 Z"
        fill={`url(#${gradIdGoldWing})`}
      />

      {/* 8. BOTTOM BOOK SPINE & SWEEPING FOUNDATION */}
      <path
        d="M62 126 C90 156 122 186 150 198 C178 186 210 156 238 126 C214 162 178 194 150 204 C122 194 86 162 62 126 Z"
        fill={`url(#${gradIdNavyWing})`}
      />

      {/* Bottom Gold Spine Dot / Spine Intersection */}
      <path
        d="M150 196 L152 204 L150 210 L148 204 Z"
        fill={`url(#${gradIdGoldWing})`}
      />
    </svg>
  );
};

export const SchoolSoulLogo: React.FC<SchoolSoulLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'auto',
  showTagline = false,
  tagline = 'Knowledge • Character • Excellence',
  animate = false,
}) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : sizeMap[size]?.markSize || 48;

  // MARK ONLY
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <SchoolSoulMarkSVG size={numericSize} idPrefix={`ss-mark-${numericSize}`} />
      </div>
    );
  }

  // TEXT ONLY
  if (variant === 'text') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <span
          className={`font-black tracking-[0.18em] text-[#0B2347] dark:text-white uppercase leading-none font-sans ${
            typeof size === 'string' ? sizeMap[size]?.textSize : 'text-base'
          }`}
          style={{ letterSpacing: '0.18em' }}
        >
          SCHOOLSOUL
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-widest mt-1">
            {tagline}
          </span>
        )}
      </div>
    );
  }

  // HORIZONTAL / COMPACT (Logo on Left, Text on Right)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <SchoolSoulMarkSVG
          size={typeof size === 'string' ? (size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'lg' ? 44 : 36) : numericSize}
          idPrefix="ss-hz"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="font-black tracking-[0.16em] text-[#0B2347] dark:text-white uppercase leading-none text-sm font-sans"
              style={{ letterSpacing: '0.16em' }}
            >
              SCHOOLSOUL
            </span>
          </div>
          {showTagline ? (
            <span className="text-[9px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5">
              {tagline}
            </span>
          ) : (
            <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 tracking-wider">
              Educational Operating System
            </span>
          )}
        </div>
      </div>
    );
  }

  // FULL VERTICAL EMBLEM (As in uploaded image: Mark + "SCHOOLSOUL" + Gold Divider)
  return (
    <div
      className={`inline-flex flex-col items-center text-center select-none ${className} ${
        animate ? 'transition-transform duration-300 hover:scale-[1.02]' : ''
      }`}
    >
      {/* Top Radiant Mark */}
      <SchoolSoulMarkSVG
        size={typeof size === 'string' ? (size === 'xs' ? 40 : size === 'sm' ? 56 : size === 'md' ? 80 : size === 'lg' ? 120 : 160) : numericSize}
        idPrefix="ss-full"
      />

      {/* Main Bold "SCHOOLSOUL" Wordmark */}
      <div className="mt-2.5">
        <h1
          className="font-black tracking-[0.18em] text-[#0B2347] dark:text-white uppercase text-xl sm:text-2xl font-sans"
          style={{ letterSpacing: '0.18em' }}
        >
          SCHOOLSOUL
        </h1>
      </div>

      {/* Golden Lower Divider with Centered Diamond Accent */}
      <div className="flex items-center justify-center gap-2 w-full max-w-[180px] mt-2 opacity-85">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#DF9C22] to-[#DF9C22]" />
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-1.5 rotate-45 bg-[#DF9C22]" />
          <div className="w-1 h-1 rounded-full bg-[#DF9C22] mt-0.5" />
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#DF9C22] to-[#DF9C22]" />
      </div>

      {showTagline && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-2 uppercase">
          {tagline}
        </p>
      )}
    </div>
  );
};

export default SchoolSoulLogo;
