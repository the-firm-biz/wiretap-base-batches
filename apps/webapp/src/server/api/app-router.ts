import { createTRPCRouter } from './trpc';
import { testPublicProcedure } from './routes/test-public-procedure';
import { verifySiweMessage } from './routes/verify-siwe-message';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage,
  testPublicProcedure: testPublicProcedure
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
