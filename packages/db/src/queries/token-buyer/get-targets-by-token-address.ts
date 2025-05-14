import { eq } from 'drizzle-orm';
import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '../../client.js';
import {
  accountEntityTrackers,
  gliderPortfolios,
  tokens,
  wallets,
  wireTapAccounts
} from '../../schema/index.js';
import { lowerEq } from '../../utils/pg-helpers.js';

export type BuyTrigger = {
  account: {
    wireTapId: number;
    accountEntityId: number;
    accountEntityAddress: string;
  },
  portfolio: {
    wireTapId: number;
    portfolioId: string;
    address: string;
  } | null,
  token: {
    id: number,
    address: string;
  },
  maxSpend: number;
};

export async function getTargetsByTokenAddress(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokenAddress: string
): Promise<BuyTrigger[]> {
  const targets = await db
    .select({
      account: {
        wireTapId: wireTapAccounts.id,
        accountEntityId: wireTapAccounts.accountEntityId,
        accountEntityAddress: wallets.address
      },
      portfolio: {
        wireTapId: gliderPortfolios.id,
        portfolioId: gliderPortfolios.portfolioId,
        address: gliderPortfolios.address,
      },
      token: {
        id: tokens.id,
        address: tokens.address
      },
      maxSpend: accountEntityTrackers.maxSpend,
    })
    .from(tokens)
    .innerJoin(
      accountEntityTrackers,
      eq(accountEntityTrackers.trackedAccountEntityId, tokens.accountEntityId)
    )
    .innerJoin(
      wireTapAccounts,
      eq(wireTapAccounts.id, accountEntityTrackers.trackerWireTapAccountId)
    )
    .innerJoin(
      wallets,
      eq(wallets.accountEntityId, wireTapAccounts.accountEntityId)
    )
    .leftJoin(
      gliderPortfolios,
      eq(gliderPortfolios.wireTapAccountId, wireTapAccounts.id)
    )
    .where(lowerEq(tokens.address, tokenAddress));
  return targets;
}
