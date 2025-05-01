import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  accountEntities,
  farcasterAccounts,
  wallets,
  xAccounts,
  type AccountEntity,
  type FarcasterAccount,
  type Wallet,
  type XAccount
} from '../schema/accounts/index.js';
import { tokens, type Token } from '../schema/tokens.js';

export type GetAccountEntityResult = {
  accountEntity: AccountEntity;
  wallets: Wallet[];
  farcasterAccounts: FarcasterAccount[];
  xAccounts: XAccount[];
  tokens: Token[];
};

export async function getAccountEntity(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityId: number
): Promise<GetAccountEntityResult | undefined> {
  const accountEntityInfo = await db
    .select({
      accountEntity: accountEntities,
      wallet: wallets,
      farcasterAccount: farcasterAccounts,
      xAccount: xAccounts,
      token: tokens
    })
    .from(accountEntities)
    .leftJoin(wallets, eq(accountEntities.id, wallets.accountEntityId))
    .leftJoin(
      farcasterAccounts,
      eq(accountEntities.id, farcasterAccounts.accountEntityId)
    )
    .leftJoin(xAccounts, eq(accountEntities.id, xAccounts.accountEntityId))
    .leftJoin(tokens, eq(accountEntities.id, tokens.accountEntityId))
    .where(eq(accountEntities.id, accountEntityId));

  if (!accountEntityInfo[0]) {
    return undefined;
  }

  const aggregatedAccountEntityInfo =
    accountEntityInfo.reduce<GetAccountEntityResult>(
      (acc, curr) => {
        const { wallet, farcasterAccount, xAccount, token } = curr;
        if (wallet && !acc.wallets.find((w) => w.address === wallet.address)) {
          acc.wallets.push(wallet);
        }
        if (
          farcasterAccount &&
          !acc.farcasterAccounts.find((f) => f.fid === farcasterAccount.fid)
        ) {
          acc.farcasterAccounts.push(farcasterAccount);
        }
        if (xAccount && !acc.xAccounts.find((x) => x.xid === xAccount.xid)) {
          acc.xAccounts.push(xAccount);
        }
        if (token && !acc.tokens.find((t) => t.address === token.address)) {
          acc.tokens.push(token);
        }
        return acc;
      },
      {
        accountEntity: accountEntityInfo[0].accountEntity,
        wallets: [],
        farcasterAccounts: [],
        xAccounts: [],
        tokens: []
      }
    );

  return aggregatedAccountEntityInfo;
}
