import React, { useId } from 'react';

interface NirvahaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  tagline?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export const NirvahaLogo: React.FC<NirvahaLogoProps> = ({
  size = 'md',
  showText = false,
  tagline,
  className = '',
  variant = 'dark',
}) => {
  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const bgGradId = `logoPlumBg-${idPrefix}`;
  const glowGradId = `logoVioletGlow-${idPrefix}`;
  const goldGradId = `logoGold-${idPrefix}`;
  const ambientGradId = `logoAmbient-${idPrefix}`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${sizeMap[size]} shrink-0 rounded-xl overflow-hidden shadow-sm shadow-[#38104E]/20 transition-transform group-hover:scale-105`}
      >
        <svg viewBox="0 0 240 240" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id={bgGradId} x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A1566" />
              <stop offset="50%" stopColor="#350E4A" />
              <stop offset="100%" stopColor="#240733" />
            </linearGradient>

            <linearGradient id={glowGradId} x1="60" y1="40" x2="180" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#6B21A8" />
            </linearGradient>

            <linearGradient id={goldGradId} x1="100" y1="50" x2="190" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <radialGradient id={ambientGradId} cx="120" cy="70" r="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#350E4A" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* Medallion Squircle */}
          <rect x="8" y="8" width="224" height="224" rx="52" fill={`url(#${bgGradId})`} />
          <rect x="8" y="8" width="224" height="224" rx="52" fill={`url(#${ambientGradId})`} />
          <rect
            x="8"
            y="8"
            width="224"
            height="224"
            rx="52"
            stroke={`url(#${glowGradId})`}
            strokeWidth="3.5"
            strokeOpacity="0.65"
          />

          {/* Subtle Concentric Alignment Ring */}
          <circle
            cx="120"
            cy="120"
            r="80"
            stroke="#C084FC"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeDasharray="4 6"
          />

          {/* Left Vertical Pillar */}
          <path
            d="M72 166V78C72 74.6863 74.6863 72 78 72H88C91.3137 72 94 74.6863 94 78V166C94 169.314 91.3137 172 88 172H78C74.6863 172 72 169.314 72 166Z"
            fill={`url(#${glowGradId})`}
          />

          {/* Right Vertical Pillar */}
          <path
            d="M146 166V78C146 74.6863 148.686 72 152 72H162C165.314 72 168 74.6863 168 78V166C168 169.314 165.314 172 162 172H152C148.686 172 146 169.314 146 166Z"
            fill={`url(#${glowGradId})`}
          />

          {/* Diagonal Energy Stream */}
          <path
            d="M77 74L163 166C165.2 168.4 168 166.8 168 163.5V148L92 68C89.5 65.5 86 67 86 70.5V74H77Z"
            fill={`url(#${goldGradId})`}
          />

          {/* Navigational Compass Star */}
          <g transform="translate(162, 74)">
            <path
              d="M0 -15L4.2 -4.2L15 0L4.2 4.2L0 15L-4.2 4.2L-15 0L-4.2 -4.2Z"
              fill={`url(#${goldGradId})`}
            />
            <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
          </g>

          {/* Dynamic Core Node */}
          <circle cx="120" cy="120" r="6" fill="#FFFFFF" />
          <circle cx="120" cy="120" r="9" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.85" />
        </svg>
      </div>

      {/* Optional Wordmark */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-tight ${
                size === 'xl'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'lg'
                  ? 'text-xl sm:text-2xl'
                  : 'text-lg sm:text-xl'
              } ${variant === 'light' ? 'text-white' : 'text-[#38104E]'}`}
            >
              NIRVAHA
            </span>
            <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white shadow-xs tracking-wider">
              AI
            </span>
          </div>
          {tagline && (
            <p
              className={`text-[11px] hidden sm:block leading-none mt-0.5 ${
                variant === 'light' ? 'text-purple-200' : 'text-slate-500'
              }`}
            >
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
