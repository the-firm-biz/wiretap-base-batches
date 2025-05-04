'use client';

import { useState } from 'react';
import { env } from 'process';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCQueryUtils } from '@trpc/react-query';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { AppRouter } from '@/server/api/app-router';
import { createQueryClient } from './create-query-client';
import { getJwtSiweSessionCookie } from '../utils/siwe/siwe-cookies';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

const getRequestHeaders = () => {
  const headers = new Headers();
  headers.set('x-trpc-source', 'nextjs-react');

  // @TODO ENG-293 - figure out how to auth using embedded smart wallets
  const siweAuthJwt = getJwtSiweSessionCookie();
  if (siweAuthJwt) {
    headers.set('Authorization', `Bearer ${siweAuthJwt}`);
  }

  return headers;
};

// @todo TRPC - need better helper for this
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return `http://localhost:3000`;
};

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === 'development' ||
        (op.direction === 'down' && op.result instanceof Error)
    }),
    httpBatchLink({
      // @todo trpc - superjson?
      // transformer: superjson,
      url: getBaseUrl() + '/api/trpc',
      headers: getRequestHeaders
    })
  ]
});

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }

  // Browser: use singleton pattern to keep the same query client
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = createQueryClient();
  }

  return clientQueryClientSingleton;
};

/**
 * React query utils to make imperitive query calls, invalidate queries etc.
 */
export const trpcClientUtils = createTRPCQueryUtils({
  queryClient: getQueryClient(),
  client: trpcClient
});

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [memoisedClient] = useState(() => trpcClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={memoisedClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
