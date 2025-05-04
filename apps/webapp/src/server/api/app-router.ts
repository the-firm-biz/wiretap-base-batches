import { createTRPCRouter } from './trpc';
import { testPublicProcedure } from './routes/test-public-procedure';
import { verifySiweMessage } from './routes/verify-siwe-message';
import { createWireTapSessionRouter } from './routes/create-wire-tap-session';

export const appRouter = createTRPCRouter({
  verifySiweMessage: verifySiweMessage,
  testPublicProcedure: testPublicProcedure,
  wireTapSession: createWireTapSessionRouter
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
