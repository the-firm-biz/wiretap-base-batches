import { createTRPCRouter } from '../trpc';
import { sessionRouter } from './session-router/create-session-router';
import { appRouter } from './app-router/create-app-router';

export const trpcRouter = createTRPCRouter({
  app: appRouter,
  session: sessionRouter
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterKeys = keyof typeof trpcRouter;
