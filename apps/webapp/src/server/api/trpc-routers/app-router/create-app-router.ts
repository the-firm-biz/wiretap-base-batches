import { createTRPCRouter } from '../../trpc';
import { verifySiweMessage } from './verify-siwe-message';
import { getEthPriceUsd } from './get-eth-price-usd';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage,
  getEthPriceUsd: getEthPriceUsd
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
