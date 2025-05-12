import { privateProcedure } from '@/server/api/trpc';
import {
  getGliderPortfolioForWireTapAccount,
  GliderPortfolio
} from '@wiretap/db';
import { Address } from 'viem';
import { getBalance } from 'viem/actions';

interface GliderPortfolioWithBalance extends GliderPortfolio {
  address: Address;
  balance: bigint;
}

export const getAuthedAccountGliderPortfolio = privateProcedure.query(
  async ({ ctx }): Promise<GliderPortfolioWithBalance | null> => {
    const { db, wireTapAccountId, viemClient } = ctx;

    const gliderPortfolio = await getGliderPortfolioForWireTapAccount(
      db,
      wireTapAccountId
    );

    if (!gliderPortfolio) {
      return null;
    }

    const balance = await getBalance(viemClient, {
      address: gliderPortfolio.address as Address
    });

    return {
      ...gliderPortfolio,
      address: gliderPortfolio.address as Address,
      balance
    };
  }
);
