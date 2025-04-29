import { commitTokenDetailsToDb } from './commit-token-details-to-db.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';

export type FarcasterUserParams = {
  fid: number;
  username: string;
  address: Address;
};

export async function handleTokenWithFarcasterUser(
  tokenCreatedData: TokenCreatedOnChainParams,
  params: FarcasterUserParams
) {
  // [3 concurrent]
  // TODO: find users monitoring accountEntities connected to response's farcasterAccounts, wallets or xAccounts

  // [4 concurrent]
  return await commitTokenDetailsToDb({
    tokenCreatedData,
    tokenCreatorAddress: params.address,
    farcasterAccount: {
      fid: params.fid,
      username: params.username
    }
  });
}
