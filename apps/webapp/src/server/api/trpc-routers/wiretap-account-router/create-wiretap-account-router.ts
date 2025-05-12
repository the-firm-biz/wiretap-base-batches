import { createTRPCRouter } from '../../trpc';
import { getAuthedAccountGliderPortfolio } from './routes/get-authed-account-glider-portfolio';
import { getAuthedAccountTargets } from './routes/get-authed-account-targets';
import { verifySiweMessage } from './routes/verify-siwe-message';

/**
 * Routes specific to getting/setting data for the connected WireTap account
 */
export const wireTapAccountRouter = createTRPCRouter({
  getAuthedAccountGliderPortfolio: getAuthedAccountGliderPortfolio,
  getAuthedAccountTargets: getAuthedAccountTargets,
  verifySiweMessage: verifySiweMessage
});

export type WireTapAccountRouter = typeof wireTapAccountRouter;
export type WireTapAccountRouterKeys = keyof typeof wireTapAccountRouter;
