import React from 'react';

interface PowerTokenProps {
  base: React.ReactNode;
  exponent: React.ReactNode;
  baseHighlight?: boolean;
  expHighlight?: boolean;
  className?: string;
}

export const PowerToken: React.FC<PowerTokenProps> = ({
  base,
  exponent,
  baseHighlight = false,
  expHighlight = false,
  className = '',
}) => {
  return (
    <span className={`font-math inline-flex items-baseline tabular-nums ${className}`}>
      <span
        className={
          baseHighlight
            ? 'rounded bg-[#dbeafe] px-1 text-[#172554] font-semibold'
            : ''
        }
      >
        {base}
      </span>
      <sup
        className={`ml-0.5 text-[0.66em] leading-none font-semibold ${
          expHighlight
            ? 'rounded bg-[#b9f1ea] px-1 py-0.5 text-[#172554]'
            : 'text-[#3858d6]'
        }`}
      >
        {exponent}
      </sup>
    </span>
  );
};

/**
 * Renders simple inline exponent strings like "2^5", "(-3)^2", "3^(2x + 1)" with crisp superscripts.
 */
export const InlineMathText: React.FC<{ text: string }> = ({ text }) => {
  // Split tokens containing caret ^
  const parts = text.split(/(\S+\^\([^)]+\)|\S+\^-?\d+\/?\d*|\S+\^[a-zA-Z0-9+-]+)/g);
  return (
    <>
      {parts.map((part, idx) => {
        const match = part.match(/^(.+?)\^(\([^)]+\)|-?\d+\/?\d*|[a-zA-Z0-9+-]+)$/);
        if (!match) return <React.Fragment key={idx}>{part}</React.Fragment>;
        const [, base, rawExp] = match;
        const cleanExp = rawExp.startsWith('(') && rawExp.endsWith(')')
          ? rawExp.slice(1, -1)
          : rawExp;
        return (
          <span key={idx} className="font-math inline-flex items-baseline font-medium text-[#172554]">
            <span>{base}</span>
            <sup className="ml-[1px] text-[0.72em] text-[#3858d6] font-semibold leading-none">
              {cleanExp}
            </sup>
          </span>
        );
      })}
    </>
  );
};
