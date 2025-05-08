'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoWiretapProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function LogoWiretap({
  width = 168,
  height = 56,
  className,
  priority = false
}: LogoWiretapProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the theme-aware logo
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div style={{ width, height }} />;
  }

  const logoSrc =
    resolvedTheme === 'dark'
      ? '/logo-wiretap.png'
      : '/logo-wiretap-inverse.png';

  return (
    <Image
      src={logoSrc}
      alt="WireTap Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
