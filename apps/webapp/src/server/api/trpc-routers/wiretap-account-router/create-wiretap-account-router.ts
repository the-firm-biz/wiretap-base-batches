import { createTRPCRouter } from '../../trpc';
import { getGliderPortfolioForAuthedAccount } from './routes/get-glider-portfolio-for-authed-account';

/**
 * Routes specific to getting/setting data for the connected WireTap account
 */
export const wireTapAccountRouter = createTRPCRouter({
  getGliderPortfolioForAuthedAccount: getGliderPortfolioForAuthedAccount
});

export type WireTapAccountRouter = typeof wireTapAccountRouter;
export type WireTapAccountRouterKeys = keyof typeof wireTapAccountRouter;
