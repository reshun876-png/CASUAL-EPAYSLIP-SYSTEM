import React from 'react';

interface GhsEmblemProps {
  className?: string;
  size?: number;
}

export const GhsEmblem: React.FC<GhsEmblemProps> = ({ className = 'w-12 h-12', size = 48 }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer concentric crest */}
      <circle cx="50" cy="50" r="47" fill="#005A36" stroke="#D4A017" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" fill="#FFFFFF" stroke="#005A36" strokeWidth="1.2" />

      {/* Ghana National Tricolor Ring Arc */}
      <circle cx="50" cy="50" r="35" fill="#005A36" />
      <circle cx="50" cy="50" r="31" fill="#F8FAFC" />

      {/* Medical Cross / Asclepius Symbol */}
      <path
        d="M45 28H55V44H71V54H55V70H45V54H29V44H45V28Z"
        fill="#006B3F"
        stroke="#D4A017"
        strokeWidth="1"
      />

      {/* Red Center Heart / Care Emblem */}
      <circle cx="50" cy="49" r="6" fill="#CE1126" />
      <path
        d="M50 46C51.5 44 54 44.5 54 46.5C54 48.5 50 51 50 51C50 51 46 48.5 46 46.5C46 44.5 48.5 44 50 46Z"
        fill="#FFFFFF"
      />

      {/* Gold Star of Ghana */}
      <polygon
        points="50,18 52,23 57,23 53,26 55,31 50,28 45,31 47,26 43,23 48,23"
        fill="#FCD116"
      />

      {/* Text ring indicator */}
      <circle cx="50" cy="50" r="44" stroke="#D4A017" strokeWidth="0.8" strokeDasharray="3 3" />
    </svg>
  );
};

export const GhanaFlagStrip: React.FC<{ className?: string }> = ({ className = 'h-1.5 w-full' }) => {
  return (
    <div className={`flex ${className} overflow-hidden shadow-sm`}>
      <div className="bg-[#CE1126] flex-1" title="Red" />
      <div className="bg-[#FCD116] flex-1 flex items-center justify-center relative" title="Gold">
        <span className="w-1.5 h-1.5 bg-black rounded-full inline-block"></span>
      </div>
      <div className="bg-[#006B3F] flex-1" title="Green" />
    </div>
  );
};
