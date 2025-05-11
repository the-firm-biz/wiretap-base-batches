import { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { trpcRouter } from '@/server/api/trpc-routers';
import { createInnerContext } from '@/server/api/trpc';
import {
  getCacheControlHeader,
  getDefaultCacheControlHeader
} from '@/app/utils/routeCaching';

/**
 * This wraps the `createInnerContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createOuterContext = (req: NextRequest) => {
  return createInnerContext({
    headers: req.headers
  });
};

// @todo trpc - as this needs to extend, create-t3-turbo may be a good reference for how to do it
// https://github.com/t3-oss/create-t3-turbo/blob/main/apps/nextjs/src/app/api/trpc/%5Btrpc%5D/route.ts
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: trpcRouter,
    createContext: () => createOuterContext(req),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
    responseMeta: (opts) => {
      const { pathname } = new URL(req.url);
      const cacheControlHeader = getCacheControlHeader(pathname);
      if (opts.errors.length > 0) {
        // Override cache settings to a short duration for error responses
        // since browsers like Chrome cache even 500 responses with Cache-Control headers
        return {
          headers: {
            'cache-control': getDefaultCacheControlHeader()
          }
        };
      }
      return {
        headers: {
          'cache-control': cacheControlHeader
        }
      };
    }
  });

export { handler as GET, handler as POST };
