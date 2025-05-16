'use client';

import { useCallback } from 'react';
import confetti, { Options } from 'canvas-confetti';

const defaultPixelFireworkOptions: Options = {
  zIndex: 100000,
  angle: 90, // Centered
  spread: 360,
  gravity: 0.5,
  ticks: 120,
  decay: 0.9, // slows and fades out after burst
  particleCount: 40,
  shapes: ['square'], // Use built-in 'square' shape
  disableForReducedMotion: true,
  flat: true
};

function getAccentColor(): string {
  if (typeof window !== 'undefined') {
    // Get the computed value of --color-accent from the root element
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#5A6F5F'
    ); // fallback
  }
  return '#5A6F5F'; // fallback for SSR
}

// Helper to get a random origin within the visible area
function getRandomOrigin() {
  // x and y are between 0 and 1 (canvas-confetti uses this for relative position)
  return {
    x: 0.2 + Math.random() * 0.6, // avoid edges
    y: 0.2 + Math.random() * 0.6
  };
}

function getRandomStartVelocity() {
  return 10 + Math.random() * 14; // between 10 and 24
}

export const useThrowPixelFirework = (options?: Options) => {
  return useCallback(() => {
    // Launch 5 clusters, 0.3s apart, each from a different random origin and explosion size
    Array.from({ length: 5 }).forEach((_, i) => {
      setTimeout(() => {
        confetti({
          ...defaultPixelFireworkOptions,
          ...options,
          colors: [getAccentColor()],
          origin: getRandomOrigin(),
          scalar: 0.3, // fixed pixel size
          startVelocity: getRandomStartVelocity() // random explosion size
        });
      }, i * 300); // delay between each cluster in milliseconds
    });
  }, [options]);
};

export const PixelFirework = ({ options }: { options?: Options }) => {
  const throwFirework = useThrowPixelFirework(options);
  return (
    <button type="button" onClick={throwFirework}>
      Trigger Pixel Firework
    </button>
  );
};
