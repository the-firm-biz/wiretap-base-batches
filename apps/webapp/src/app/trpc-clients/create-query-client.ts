import {
  defaultShouldDehydrateQuery,
  QueryClient
} from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1 // retry all erroring queries once
      },
      dehydrate: {
        // @TODO trpc - superjson?
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending'
      },
      hydrate: {
        // @TODO trpc - superjson?
        // deserializeData: superjson.deserialize,
      }
    }
  });
}
