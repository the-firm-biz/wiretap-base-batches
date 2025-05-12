import type { Address } from 'viem';
import { getTargetsByTokenAddress, singletonDb } from '@wiretap/db';
import { env } from '../env.js';
import { bigIntReplacer } from '@wiretap/utils/shared';

export type BuyTrigger = {
  wireTapId: number;
  accountEntityId: number;
  portfolioId: string;
  tokenAddress: Address;
};

export async function buyTrigger(tokenAddress: Address) {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });
  const trackers = await getTargetsByTokenAddress(db, tokenAddress);
  const buyTriggers = trackers
    .map((t) => {
      return {
        wireTapId: t.wireTapAccounts.id,
        accountEntityId: t.wireTapAccounts.accountEntityId,
        portfolioId: t.gliderPortfolios?.portfolioId,
        tokenAddress
      };
    })
    .filter((t) => {
      if (!t.portfolioId) {
        // todo: notify on missing portfolio
        console.log(`Excluded trigger for ${JSON.stringify(t)} `);
        return false;
      }
      return true;
    });

  // parallel part for buy triggers

  console.log(`${JSON.stringify(buyTriggers, bigIntReplacer, 2)}`);
}
