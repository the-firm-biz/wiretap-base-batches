import { createTRPCRouter } from '../trpc';
import { sessionRouter } from './session-router/create-session-router';
import { appRouter } from './app-router/create-app-router';
import { gliderRouter } from './glider-router/create-session-router';
export const trpcRouter = createTRPCRouter({
  app: appRouter,
  session: sessionRouter,
  glider: gliderRouter
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterKeys = keyof typeof trpcRouter;
