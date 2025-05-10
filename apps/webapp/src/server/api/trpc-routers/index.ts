import { createTRPCRouter } from '../trpc';
import {
  sessionRouter,
  SessionRouterKeys
} from './session-router/create-session-router';
import { appRouter, AppRouterKeys } from './app-router/create-app-router';
import {
  gliderRouter,
  GliderRouterKeys
} from './glider-router/create-glider-router';
import {
  wireTapAccountRouter,
  WireTapAccountRouterKeys
} from './wiretap-account-router/create-wiretap-account-router';

export const trpcRouter = createTRPCRouter({
  app: appRouter,
  session: sessionRouter,
  glider: gliderRouter,
  wireTapAccount: wireTapAccountRouter
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterKeys = keyof typeof trpcRouter;

export type AllTrpcRouterKeys =
  | AppRouterKeys
  | GliderRouterKeys
  | SessionRouterKeys
  | WireTapAccountRouterKeys;
