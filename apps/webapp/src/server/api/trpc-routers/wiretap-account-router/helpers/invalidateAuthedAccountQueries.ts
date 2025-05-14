import { trpcClientUtils } from '@/app/trpc-clients/trpc-react-client';

/**
 * Invalidate all account-specific queries. To be called on account change/sign out
 */
export const invalidateAuthedAccountQueries = () => {
  trpcClientUtils.wireTapAccount.getAuthedAccountGliderPortfolio.invalidate();
  trpcClientUtils.wireTapAccount.getAuthedAccountTargets.invalidate();
  trpcClientUtils.glider.invalidate();
};
