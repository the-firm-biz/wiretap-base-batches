import { createTRPCRouter } from '../../trpc';
import { verifySiweMessage } from './verify-siwe-message';
import { getEthPriceUsd } from './get-eth-price-usd';
import { targetSearch } from './target-search';
import { getPopularTargets } from './get-popular-targets';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage,
  getEthPriceUsd: getEthPriceUsd,
  targetSearch: targetSearch,
  getPopularTargets: getPopularTargets
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
