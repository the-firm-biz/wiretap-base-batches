import React, { useEffect, useState } from 'react';
import { safeImageSrc } from '../utils/safeImageSrc';
import { Skeleton } from './ui/skeleton';

interface ExternalImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

export const ExternalImage = React.forwardRef<
  HTMLImageElement,
  ExternalImageProps
>(({ src, fallbackSrc, ...rest }, ref) => {
  const [safeSrc, setSafeSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSafeSrc = async () => {
      const safeSrc = await safeImageSrc(src, fallbackSrc);
      setSafeSrc(safeSrc);
    };
    fetchSafeSrc();
  }, [src, fallbackSrc]);

  if (!safeSrc) return <Skeleton className={rest.className} />;

  return <img src={safeSrc} {...rest} ref={ref} />;
});

ExternalImage.displayName = 'ExternalImage';
