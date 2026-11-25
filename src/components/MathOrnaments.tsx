import React from 'react';

interface OrnamentProps {
  variant: 'peraga' | 'permainan' | 'latihan' | 'lomba';
  className?: string;
}

/**
 * Crisp SVG mathematical diagrams & geometric ornaments tailored to each learning room.
 */
export const MathBannerOrnament: React.FC<OrnamentProps> = ({ variant, className = '' }) => {
  if (variant === 'peraga') {
    // Exponential curve y = 2^x vs flat line y = 1^x on coordinate axes
    return (
      <svg
        viewBox="0 0 240 130"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="peragaCurve" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Coordinate grid */}
        <g stroke="rgba(255,255,255,0.16)" strokeWidth="1">
          <line x1="20" y1="25" x2="220" y2="25" />
          <line x1="20" y1="55" x2="220" y2="55" />
          <line x1="20" y1="85" x2="220" y2="85" />
          <line x1="60" y1="12" x2="60" y2="115" />
          <line x1="120" y1="12" x2="120" y2="115" />
          <line x1="180" y1="12" x2="180" y2="115" />
        </g>
        {/* Axes */}
        <line x1="20" y1="105" x2="222" y2="105" stroke="#99f6e4" strokeWidth="1.8" />
        <line x1="80" y1="10" x2="80" y2="118" stroke="#99f6e4" strokeWidth="1.8" />
        {/* Constant line y = 1^x */}
        <line x1="24" y1="85" x2="216" y2="85" stroke="#fca5a5" strokeWidth="2" strokeDasharray="5 4" />
        {/* Exponential curve y = a^x */}
        <path
          d="M 24 101 Q 95 98, 138 72 T 206 16"
          fill="none"
          stroke="url(#peragaCurve)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Intersection at (0, 1) */}
        <circle cx="80" cy="85" r="4.5" fill="#fde68a" stroke="#1e1b4b" strokeWidth="1.5" />
        <text x="88" y="79" className="fill-[#fef3c7] text-[10px] font-mono font-bold">
          (0, 1)
        </text>
        <text x="150" y="25" className="fill-[#fde68a] text-[10px] font-mono font-bold">
          y = aˣ
        </text>
        <text x="154" y="97" className="fill-[#fecaca] text-[9px] font-mono">
          y = 1ˣ
        </text>
      </svg>
    );
  }

  if (variant === 'permainan') {
    // Geometric compass arcs & branching power tree 1 -> 2 -> 4 -> 8
    return (
      <svg viewBox="0 0 240 130" className={className} aria-hidden="true">
        <g stroke="rgba(255,255,255,0.2)" fill="none">
          <circle cx="120" cy="65" r="52" strokeDasharray="4 4" />
          <circle cx="120" cy="65" r="32" />
          <polygon points="120,16 162,90 78,90" stroke="#fed7aa" strokeWidth="1.5" />
        </g>
        {/* Binary exponential tree */}
        <g stroke="#fde68a" strokeWidth="2">
          <line x1="40" y1="65" x2="95" y2="38" />
          <line x1="40" y1="65" x2="95" y2="92" />
          <line x1="95" y1="38" x2="155" y2="24" />
          <line x1="95" y1="38" x2="155" y2="52" />
          <line x1="95" y1="92" x2="155" y2="78" />
          <line x1="95" y1="92" x2="155" y2="106" />
        </g>
        <circle cx="40" cy="65" r="7" fill="#fb923c" stroke="#fff" strokeWidth="1.5" />
        <circle cx="95" cy="38" r="6" fill="#fbbf24" stroke="#fff" strokeWidth="1.5" />
        <circle cx="95" cy="92" r="6" fill="#fbbf24" stroke="#fff" strokeWidth="1.5" />
        <circle cx="155" cy="24" r="5" fill="#fef3c7" />
        <circle cx="155" cy="52" r="5" fill="#fef3c7" />
        <circle cx="155" cy="78" r="5" fill="#fef3c7" />
        <circle cx="155" cy="106" r="5" fill="#fef3c7" />
        <text x="172" y="42" className="fill-[#fef3c7] text-[11px] font-mono font-bold">
          2¹ · 2² · 2³
        </text>
        <text x="172" y="96" className="fill-[#fed7aa] text-[10px] font-mono">
          a ≠ 1
        </text>
      </svg>
    );
  }

  if (variant === 'latihan') {
    // Logarithmic/exponential spiral arcs & geometric ruler ticks
    return (
      <svg viewBox="0 0 240 130" className={className} aria-hidden="true">
        <g stroke="rgba(233,213,255,0.28)" fill="none" strokeWidth="1.2">
          <rect x="28" y="18" width="94" height="94" rx="4" />
          <rect x="122" y="18" width="58" height="58" rx="4" />
          <rect x="122" y="76" width="36" height="36" rx="4" />
          <rect x="158" y="76" width="22" height="22" rx="4" />
        </g>
        <path
          d="M 28 112 A 94 94 0 0 1 122 18 A 58 58 0 0 1 180 76 A 36 36 0 0 1 144 112"
          fill="none"
          stroke="#fde68a"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <text x="188" y="34" className="fill-[#e9d5ff] text-[11px] font-mono font-bold">
          125+
        </text>
        <text x="188" y="50" className="fill-[#ddd6fe] text-[10px] font-mono">
          aᵐ = aⁿ
        </text>
        <text x="42" y="70" className="fill-[#fef3c7] text-[12px] font-mono font-bold">
          a^(m/n)
        </text>
      </svg>
    );
  }

  // lomba: Vector race curves & podium bars
  return (
    <svg viewBox="0 0 240 130" className={className} aria-hidden="true">
      <g stroke="rgba(255,228,230,0.22)" strokeWidth="1">
        <line x1="20" y1="30" x2="220" y2="30" />
        <line x1="20" y1="65" x2="220" y2="65" />
        <line x1="20" y1="100" x2="220" y2="100" />
      </g>
      {/* Exponential speed trajectories */}
      <path d="M 24 104 Q 110 96, 212 22" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 24 104 Q 125 99, 212 48" fill="none" stroke="#99f6e4" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 24 104 Q 140 102, 212 74" fill="none" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" />
      <circle cx="212" cy="22" r="5" fill="#fde68a" stroke="#1e1b4b" strokeWidth="1.5" />
      <circle cx="212" cy="48" r="4.5" fill="#99f6e4" stroke="#1e1b4b" strokeWidth="1.5" />
      <text x="34" y="34" className="fill-[#ffe4e6] text-[11px] font-mono font-bold">
        10 SOAL · LIVE
      </text>
    </svg>
  );
};
