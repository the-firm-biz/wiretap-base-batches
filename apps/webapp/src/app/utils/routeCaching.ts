import { type AllTrpcRouterKeys } from '@/server/api/trpc-routers';

const HOUR_IN_SECONDS = 3600;

type CacheSettings = {
  path: string;
  cacheSeconds: number;
  cdnCacheSeconds: number;
};

const CACHE_SETTINGS: Partial<Record<AllTrpcRouterKeys, CacheSettings>> = {
  getPopularTargets: {
    path: '/api/trpc/app.getPopularTargets',
    cacheSeconds: HOUR_IN_SECONDS,
    cdnCacheSeconds: HOUR_IN_SECONDS
  },
  targetSearch: {
    path: '/api/trpc/app.targetSearch',
    cacheSeconds: 30,
    cdnCacheSeconds: 30
  }
};

const DEFAULT_CACHE_SETTINGS = {
  cacheSeconds: 1,
  cdnCacheSeconds: 1
};

type CacheControlHeader = `public, s-maxage=${number}, max-age=${number}`;

/**
 * Returns cache control header for a path.
 * Batch requests use default cache settings.
 * For specific caching add the path to CACHE_SETTINGS and isBatchablePath.ts
 */
export const getCacheControlHeader = (path: string): CacheControlHeader => {
  const pathCacheSettings =
    Object.values(CACHE_SETTINGS).find((setting) => setting.path === path) ??
    DEFAULT_CACHE_SETTINGS;
  return `public, s-maxage=${pathCacheSettings.cdnCacheSeconds}, max-age=${pathCacheSettings.cacheSeconds}`;
};

export const getDefaultCacheControlHeader = (): CacheControlHeader => {
  return `public, s-maxage=${DEFAULT_CACHE_SETTINGS.cdnCacheSeconds}, max-age=${DEFAULT_CACHE_SETTINGS.cacheSeconds}`;
};
