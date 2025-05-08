import { createTRPCRouter } from '../../trpc';
import { verifySiweMessage } from './verify-siwe-message';
import { getEthPriceUsd } from './get-eth-price-usd';
import { targetSearch } from './target-search';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage,
  getEthPriceUsd: getEthPriceUsd,
  targetSearch: targetSearch
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
