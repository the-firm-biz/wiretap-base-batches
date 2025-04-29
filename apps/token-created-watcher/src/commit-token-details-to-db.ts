import { env } from './env.js';
import {
  createFarcasterAccount,
  createAccountEntity,
  type FarcasterAccount,
  getFarcasterAccount,
  getOrCreateDeployerContract,
  getOrCreateToken,
  getPoolDb,
  getWallet,
  type Wallet
} from '@wiretap/db';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';

export type CommitTokenDetailsToDbParams = {
  tokenCreatedData: TokenCreatedOnChainParams;
  tokenCreatorAddress: Address;
  farcasterAccount?: {
    fid: number;
    username: string;
  };
};

const throwIfAccountEntityIdMismatch = (
  existingWallet?: Wallet,
  existingFarcasterAccount?: FarcasterAccount
) => {
  if (!existingWallet || !existingFarcasterAccount) {
    return;
  }

  const accountEntityIdMismatch =
    existingWallet.accountEntityId !== existingFarcasterAccount.accountEntityId;
  if (accountEntityIdMismatch) {
    // Should never happen
    // TODO: Can we somehow unite the account entities in this case?
    throw new Error(
      `commitTokenDetailsToDb: accountEntityId mismatch ${JSON.stringify({
        existingWallet,
        existingFarcasterAccount
      })}`
    );
  }
};

export const commitTokenDetailsToDb = async ({
  tokenCreatedData: {
    tokenAddress,
    tokenName,
    symbol,
    deployerContractAddress,
    transactionHash
  },
  tokenCreatorAddress,
  farcasterAccount
}: CommitTokenDetailsToDbParams) => {
  const { poolDb, endPoolConnection } = getPoolDb({
    databaseUrl: env.DATABASE_URL
  });

  const deployerContract = await getOrCreateDeployerContract(poolDb, {
    address: deployerContractAddress
  });

  let existingWallet = await getWallet(poolDb, tokenCreatorAddress);
  let existingFarcasterAccount = farcasterAccount
    ? await getFarcasterAccount(poolDb, farcasterAccount.fid)
    : undefined;

  throwIfAccountEntityIdMismatch(existingWallet, existingFarcasterAccount);

  let accountEntityId =
    existingWallet?.accountEntityId ??
    existingFarcasterAccount?.accountEntityId;

  // Brand new everything
  if (!accountEntityId) {
    const {
      accountEntity: createdAccountEntity,
      wallet: createdWallet,
      farcasterAccount: createdFarcasterAccount
    } = await createAccountEntity(poolDb, {
      newWallet: {
        address: tokenCreatorAddress
      },
      newFarcasterAccount: farcasterAccount ? farcasterAccount : undefined
    });

    accountEntityId = createdAccountEntity.id;
    existingWallet = createdWallet;
    existingFarcasterAccount = createdFarcasterAccount;
  }

  // New farcaster account for existing account entity with wallet address
  if (
    farcasterAccount &&
    !existingFarcasterAccount &&
    existingWallet?.accountEntityId
  ) {
    const createdFarcasterAccount = await createFarcasterAccount(poolDb, {
      ...farcasterAccount,
      accountEntityId: existingWallet.accountEntityId
    });
    existingFarcasterAccount = createdFarcasterAccount;
  }

  const createdToken = await getOrCreateToken(poolDb, {
    address: tokenAddress,
    deploymentContractId: deployerContract.id,
    deploymentTransactionHash: transactionHash,
    accountEntityId,
    symbol,
    name: tokenName
  });

  await endPoolConnection();

  return {
    token: createdToken,
    deployerContract,
    wallet: existingWallet,
    farcasterAccount: existingFarcasterAccount
  };
};
