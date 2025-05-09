import { privateProcedure } from '@/server/api/trpc';
import { getGliderPortfolioForWireTapAccount } from '@wiretap/db';

export const getGliderPortfolioForAuthedAccount = privateProcedure.query(
  async ({ ctx }) => {
    const { db, wireTapAccountId } = ctx;

    const gliderPortfolio = await getGliderPortfolioForWireTapAccount(
      db,
      wireTapAccountId
    );

    return gliderPortfolio;
  }
);
