import { createTRPCRouter } from '../trpc';
import { sessionRouter } from './session-router/create-session-router';
import { appRouter } from './app-router/create-app-router';
import { gliderRouter } from './glider-router/create-glider-router';
import { wireTapAccountRouter } from './wiretap-account-router/create-wiretap-account-router';

export const trpcRouter = createTRPCRouter({
  app: appRouter,
  session: sessionRouter,
  glider: gliderRouter,
  wireTapAccount: wireTapAccountRouter
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterKeys = keyof typeof trpcRouter;
