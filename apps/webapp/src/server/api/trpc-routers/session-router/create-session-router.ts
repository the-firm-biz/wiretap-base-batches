import { createTRPCRouter } from '../../trpc';
import { createWireTapSession } from './routes/create-wire-tap-session';

export const sessionRouter = createTRPCRouter({
  createWireTapSession: createWireTapSession
});

export type SessionRouter = typeof sessionRouter;
export type SessionRouterKeys = keyof typeof sessionRouter;
