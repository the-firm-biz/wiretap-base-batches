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
  wireTapAccounts
} from '../../schema/index.js';
import { lowerEq } from '../../utils/pg-helpers.js';

/**
 * Counts the number of tokens deployed by a specific token creator entity
 */
export async function getTargetsByTokenAddress(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokenAddress: string
) {
  const targets = await db
    .select({
      maxSpend: accountEntityTrackers.maxSpend,
      wireTapAccounts,
      gliderPortfolios
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
    .leftJoin(
      gliderPortfolios,
      eq(gliderPortfolios.wireTapAccountId, wireTapAccounts.id)
    )
    .where(lowerEq(tokens.address, tokenAddress));
  return targets;
}
