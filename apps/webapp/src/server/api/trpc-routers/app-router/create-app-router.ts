import { createTRPCRouter } from '../../trpc';
import { verifySiweMessage } from './verify-siwe-message';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
