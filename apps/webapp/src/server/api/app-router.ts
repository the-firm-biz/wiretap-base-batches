import { testPublicProcedure } from './routes/test-public-procedure';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  testPublicProcedure: testPublicProcedure
});

export type AppRouter = typeof appRouter;
export type AppRouterKeys = keyof typeof appRouter;
