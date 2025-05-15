'use client';
import React from 'react';

const ReelToReelAnimation: React.FC = () => {
  const [angle, setAngle] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setAngle((a) => (a + 2) % 360), 16);
    return () => clearInterval(id);
  }, []);

  return (
    <svg
      width="208"
      height="104"
      viewBox="0 0 208 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Reel */}
      <g
        className="reel reel-left"
        transform={`translate(48, 48) rotate(${angle})`}
      >
        <circle cx="0" cy="0" r="47.5" stroke="var(--color-foreground)" />
        <circle cx="0" cy="0" r="12.5" stroke="var(--color-foreground)" />
        <circle cx="0" cy="0" r="3.5" stroke="var(--color-foreground)" />
        <path
          d="M0 -36C3.0199 -36 6.0278 -35.62 8.9528 -34.869L5.3717 -20.9214C3.6167 -21.372 1.8119 -21.6 0 -21.6V-36Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
        <path
          d="M31.3538 18.1769C29.8439 20.7922 28.0108 23.2072 25.8979 25.3648L15.6095 15.2896C16.8773 13.9951 17.9771 12.5461 18.8831 10.9769L31.3538 18.1769Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
        <path
          d="M-30.9998 18.1766C-32.5098 15.5613 -33.6847 12.7664 -34.4968 9.8577L-20.6272 5.9853C-20.14 7.7305 -19.435 9.4074 -18.5291 10.9766L-30.9998 18.1766Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
      </g>
      {/* Right Reel */}
      <g
        className="reel reel-right"
        transform={`translate(160, 48) rotate(${angle})`}
      >
        <circle cx="0" cy="0" r="47.5" stroke="var(--color-foreground)" />
        <circle cx="0" cy="0" r="12.5" stroke="var(--color-foreground)" />
        <circle cx="0" cy="0" r="3.5" stroke="var(--color-foreground)" />
        <path
          d="M-0.177 -36C7.426 -36 14.833 -33.5932 20.984 -29.1246L12.519 -17.4748C8.829 -20.1559 4.385 -21.6 -0.177 -21.6V-36Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
        <path
          d="M31.177 18.1769C27.376 24.7608 21.588 29.9724 14.643 33.0646L8.786 19.9095C12.953 18.0542 16.426 14.9273 18.706 10.9769L31.177 18.1769Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
        <path
          d="M-31.177 18.1766C-34.978 11.5927 -36.597 3.9744 -35.802 -3.5864L-21.481 -2.0812C-21.958 2.4553 -20.987 7.0263 -18.706 10.9766L-31.177 18.1766Z"
          stroke="var(--color-foreground)"
          strokeWidth={1}
        />
      </g>
      {/* Tape Path and Rectangle (absolute coordinates) */}
      <circle
        opacity="0.5"
        cx="160"
        cy="48"
        r="24"
        stroke="var(--color-foreground)"
      />
      <circle
        opacity="0.5"
        cx="48"
        cy="48"
        r="17"
        stroke="var(--color-foreground)"
      />
      <path opacity="0.5" d="M40 63L89 89" stroke="var(--color-foreground)" />
      <path opacity="0.5" d="M163 72L118 89" stroke="var(--color-foreground)" />
      <rect
        x="89.5"
        y="88.5"
        width="29"
        height="15"
        stroke="var(--color-foreground)"
      />
    </svg>
  );
};

export default ReelToReelAnimation;
