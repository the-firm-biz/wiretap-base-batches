import { createTRPCRouter } from '../../trpc';
import { getEthPriceUsd } from './get-eth-price-usd';
import { targetSearch } from './target-search';
import { getPopularTargets } from './get-popular-targets';
import { getTokensForDiscoverFeed } from './get-tokens-for-discover-feed';

export const appRouter = createTRPCRouter({
  getEthPriceUsd: getEthPriceUsd,
  targetSearch: targetSearch,
  getPopularTargets: getPopularTargets,
  getTokensForDiscoverFeed: getTokensForDiscoverFeed
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
