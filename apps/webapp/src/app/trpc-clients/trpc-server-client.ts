import 'server-only';

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { headers as nextHeaders } from 'next/headers';
import { createInnerContext } from '@/server/api/trpc';
import { AppRouter, appRouter } from '@/server/api/app-router';
import { createQueryClient } from './create-query-client';

/**
 * This wraps the `createInnerContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createServerContext = cache(async () => {
  const headers = new Headers(await nextHeaders());

  headers.set('x-trpc-source', 'rsc');
  return createInnerContext({
    headers
  });
});

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.someProcedure();
 */
export const trpcServerCaller = appRouter.createCaller(createServerContext);

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient);

export const trpcServerClient = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createServerContext,
  queryClient: getQueryClient
});
