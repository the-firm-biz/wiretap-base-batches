import type { Address } from 'viem';
import { getTargetsByTokenAddress, singletonDb } from '@wiretap/db';
import { env } from '../env.js';
import { bigIntReplacer } from '@wiretap/utils/shared';
import { httpPublicClient } from '../rpc-clients.js';
import { callWithBackOff } from '@wiretap/utils/server';

export type BuyTrigger = {
  wireTapId: number;
  accountEntityId: number;
  portfolioId: string;
  portfolioAddress: Address;
  tokenAddress: Address;
  maxSpend: number;
  balance: bigint;
};

type BuyTriggerNoBalance = Omit<BuyTrigger, 'balance'> | undefined;

export async function buyTrigger(tokenAddress: Address) {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });
  const trackers = await getTargetsByTokenAddress(db, tokenAddress);
  const buyTriggers = trackers
    .map((t): BuyTriggerNoBalance => {
      if (!(t.gliderPortfolios?.portfolioId && t.gliderPortfolios?.address)) {
        // todo: notify on missing portfolio
        console.log(`No portfolio for ${JSON.stringify(t.wireTapAccounts)}`);
        return undefined;
      }
      return {
        maxSpend: t.maxSpend,
        wireTapId: t.wireTapAccounts.id,
        accountEntityId: t.wireTapAccounts.accountEntityId,
        portfolioId: t.gliderPortfolios.portfolioId,
        portfolioAddress: t.gliderPortfolios.address as Address,
        tokenAddress
      };
    })
    .map(async (t: BuyTriggerNoBalance): Promise<BuyTrigger | undefined> => {
      if (!t) {
        return;
      }
      const balance = await callWithBackOff(
        () =>
          httpPublicClient.getBalance({
            address: t.portfolioAddress,
            blockTag: 'latest'
          }),
        `getBalance for portfolio ${t.portfolioAddress}`
      );
      const isBalanceSufficient = balance && balance > 0;
      if (!isBalanceSufficient) {
        console.log(`Insufficient portfolio balance ${t.portfolioAddress}`);
        return;
      }
      return {
        ...t,
        balance
      };
    })
    .filter((t) => {
      return !!t;
    });

  console.log(`${JSON.stringify(buyTriggers, bigIntReplacer, 2)}`);
}
