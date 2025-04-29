import { decodeFunctionData } from 'viem/utils';
import { createHttpPublicClient } from '@wiretap/utils/shared';
import { CLANKER_ABI } from '@wiretap/config';
import { type Address } from 'viem';
import { type ParsedTokenContext } from './types/index.js';
import { getTokenDeploymentSource } from './get-token-deployment-source.js';
import { handleClankerFarcaster } from './handle-clanker-farcaster.js';
import { env } from './env.js';

interface HandleDelegatedClankerDeployerParams {
  transactionHash: `0x${string}`;
  tokenAddress: Address;
  deployerContractAddress: Address;
  symbol: string;
  msgSender: Address;
}

export async function handleDelegatedClankerDeployer({
  transactionHash,
  tokenAddress,
  symbol,
  msgSender
}: HandleDelegatedClankerDeployerParams) {
  const httpPublicClient = createHttpPublicClient({
    alchemyApiKey: env.ALCHEMY_API_KEY
  });
  const transaction = await httpPublicClient.getTransaction({
    hash: transactionHash
  });

  const { args: transactionArgs } = decodeFunctionData({
    abi: CLANKER_ABI,
    data: transaction.input
  });

  /** Validate decoded transaction args */
  const isTokenConfigInArgs =
    typeof transactionArgs[0] === 'object' &&
    'tokenConfig' in transactionArgs[0];

  if (!transactionArgs || !isTokenConfigInArgs) {
    // @todo error - handle gracefully
    throw new Error(
      `decoded transaction args not expected shape: ${JSON.stringify(transactionArgs)}`
    );
  }

  const transactionArg = transactionArgs[0];
  const tokenConfig = transactionArg.tokenConfig;
  const tokenContext = JSON.parse(tokenConfig.context) as ParsedTokenContext;

  const deploymentSource = getTokenDeploymentSource({
    tokenContextInterface: tokenContext.interface,
    platform: tokenContext.platform
  });

  if (deploymentSource === 'clanker_farcaster') {
    // @todo - https://linear.app/the-firm/issue/ENG-278/[indexer]-special-handling-for-clanker-farcaster-deployments
    await handleClankerFarcaster({
      tokenAddress,
      symbol,
      fid: tokenContext.id,
      transactionHash,
      messageId: tokenContext.messageId
    });
    return;
  }

  console.log('handleDelegatedClankerDeployer', `::${deploymentSource}::`, {
    interface: tokenContext.interface,
    platform: tokenContext.platform,
    id: tokenContext.id,
    messageId: tokenContext.messageId,
    tokenAddress,
    symbol,
    transactionHash,
    msgSender
  });
}
