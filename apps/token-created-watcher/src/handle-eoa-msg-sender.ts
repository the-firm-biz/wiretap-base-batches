import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { type Address } from 'viem';
import { env } from './env.js';
import {
  getOrCreateDeployerContract,
  getOrCreateToken,
  getOrCreateWalletByAddress,
  singletonDb
} from '@wiretap/db';
interface HandleEOAMsgSenderParams {
  msgSender: Address;
  tokenAddress: Address;
  tokenName: string;
  deployerContractAddress: Address;
  symbol: string;
  transactionHash: `0x${string}`;
}

export async function handleEOAMsgSender({
  msgSender,
  tokenAddress,
  tokenName,
  deployerContractAddress,
  symbol,
  transactionHash
}: HandleEOAMsgSenderParams) {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  // [1 concurrent]
  // TODO: find msgSender in walletAddresses table
  // TODO: find users monitoring that tokenCreatedEntity

  // [2 concurrent]
  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });
  const userResponse = await fetchBulkUsersByEthOrSolAddress(neynarClient, [
    msgSender
  ]);

  if (!userResponse || userResponse.length === 0) {
    // [4 concurrent]
    const deployerContract = await getOrCreateDeployerContract(db, {
      address: deployerContractAddress
    });
    const wallet = await getOrCreateWalletByAddress(db, msgSender);
    await getOrCreateToken(db, {
      address: tokenAddress,
      deploymentContractId: deployerContract.id,
      tokenCreatorEntityId: wallet.id,
      symbol,
      name: tokenName
    });
    // TODO: Slack notification
    return;
  }

  const neynarUser = userResponse[0];

  // [3 concurrent]
  // TODO: find users monitoring tokenCreatorEntities connected to response's farcasterAccounts, walletAddresses or xAccounts

  // [4 concurrent]
  const deployerContract = await getOrCreateDeployerContract(db, {
    address: deployerContractAddress
  });
  const wallet = await getOrCreateWalletByAddress(db, msgSender);
  await getOrCreateToken(db, {
    address: tokenAddress,
    deploymentContractId: deployerContract.id,
    tokenCreatorEntityId: wallet.id,
    symbol,
    name: tokenName
  });

  // TODO: Save naynar data to DB

  console.log('Neynar user found', {
    neynarUser,
    tokenAddress,
    symbol,
    transactionHash
  });
}
