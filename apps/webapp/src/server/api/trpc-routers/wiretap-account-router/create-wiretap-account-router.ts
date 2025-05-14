import { createTRPCRouter } from '../../trpc';
import { getAuthedAccountGliderPortfolio } from './routes/get-authed-account-glider-portfolio';
import { getAuthedAccountTargets } from './routes/get-authed-account-targets';
import { verifySiweMessage } from './routes/verify-siwe-message';
import { trackTargetForAuthedAccount } from './routes/track-target-for-authed-account';
import { untrackTargetForAuthedAccount } from './routes/untrack-target-for-authed-account';

/**
 * Routes specific to getting/setting data for the connected WireTap account
 */
export const wireTapAccountRouter = createTRPCRouter({
  getAuthedAccountGliderPortfolio: getAuthedAccountGliderPortfolio,
  getAuthedAccountTargets: getAuthedAccountTargets,
  verifySiweMessage: verifySiweMessage,
  trackTargetForAuthedAccount: trackTargetForAuthedAccount,
  untrackTargetForAuthedAccount: untrackTargetForAuthedAccount
});

export type WireTapAccountRouter = typeof wireTapAccountRouter;
export type WireTapAccountRouterKeys = keyof typeof wireTapAccountRouter;
