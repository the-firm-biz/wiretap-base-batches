import { createTRPCRouter } from '../../trpc';
import { getEthPriceUsd } from './get-eth-price-usd';
import { targetSearch } from './target-search';
import { getPopularTargets } from './get-popular-targets';

export const appRouter = createTRPCRouter({
  getEthPriceUsd: getEthPriceUsd,
  targetSearch: targetSearch,
  getPopularTargets: getPopularTargets
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
