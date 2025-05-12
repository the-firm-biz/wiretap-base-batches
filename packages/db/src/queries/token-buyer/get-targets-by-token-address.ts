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
  wireTapId: number;
  accountEntityId: number;
  accountEntityAddress: string;
  portfolioId: string | null;
  portfolioAddress: string | null;
  tokenAddress: string;
  maxSpend: number;
};

export async function getTargetsByTokenAddress(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokenAddress: string
): Promise<BuyTrigger[]> {
  const targets = await db
    .select({
      maxSpend: accountEntityTrackers.maxSpend,
      wireTapId: wireTapAccounts.id,
      accountEntityAddress: wallets.address,
      accountEntityId: wireTapAccounts.accountEntityId,
      portfolioId: gliderPortfolios.portfolioId,
      portfolioAddress: gliderPortfolios.address,
      tokenAddress: tokens.address
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
