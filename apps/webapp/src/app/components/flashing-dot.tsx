import React from 'react';

interface FlashingDotProps {
  className?: string;
  style?: React.CSSProperties;
  color?: string; // e.g. 'red', '#f00', 'var(--color-accent)'
  duration?: number; // in seconds
  boxShadow?: string;
}

export const FlashingDot: React.FC<FlashingDotProps> = ({
  className = '',
  style = {},
  color = 'var(--color-red-500)',
  duration = 1.5,
  boxShadow
}) => (
  <>
    <span
      className={`${className}`}
      style={{
        background: color,
        animation: `flash-dot ${duration}s infinite`,
        boxShadow: boxShadow ?? `0 0 4px 1px ${color}`,
        position: 'absolute',
        ...style
      }}
    />
    <style>
      {`
        @keyframes flash-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}
    </style>
  </>
);
