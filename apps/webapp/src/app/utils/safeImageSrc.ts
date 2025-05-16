const imgQuickCache = new Map<string, string>();

/**
 * Tests if an url to an external image is a valid image,
 * if it is - returns the url, if not - returs fallbackUrl
 * Intended to be used for images with unknown source (e.g. urls retireved via ENS).
 * For local images use normal Next.js Image component.
 */
export const safeImageSrc = (
  url?: string,
  fallbackUrl: string = '/user-dithered.png'
): Promise<string | undefined> | string => {
  if (!url) return fallbackUrl;
  const cachedValidSrc = imgQuickCache.get(url);
  if (cachedValidSrc) return cachedValidSrc;

  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      imgQuickCache.set(url, url);
      resolve(url);
    };
    img.onerror = () => {
      resolve(fallbackUrl);
    };
  });
};
