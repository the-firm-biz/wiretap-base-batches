import { getTokenDeploymentSource } from './helpers/get-token-deployment-source.js';
import { handleClankerFarcaster } from './handle-clanker-farcaster.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { getTokenContext } from './helpers/get-token-context.js';
import { bigIntReplacer, type Context, trace } from '@wiretap/utils/shared';
import type { DeployTokenArgs } from './helpers/get-transaction-context.js';

export async function handleDelegatedClankerDeployer(
  tokenCreatedData: TokenCreatedOnChainParams,
  transactionArgs: DeployTokenArgs,
  { tracing: { parentSpan } = {} }: Context
) {
  const tokenContext = getTokenContext(transactionArgs);
  const deploymentSource = getTokenDeploymentSource({
    tokenContextInterface: tokenContext.interface,
    platform: tokenContext.platform
  });

  if (deploymentSource === 'clanker_farcaster') {
    await trace(
      (contextSpan) =>
        handleClankerFarcaster(
          tokenCreatedData,
          {
            fid: Number(tokenContext.id),
            messageId: tokenContext.messageId
          },
          transactionArgs,
          { tracing: { parentSpan: contextSpan } }
        ),
      {
        name: 'handleClankerFarcaster',
        parentSpan
      }
    );
    return;
  }

  // TODO: this is slack noice, we do not store anything
  // sendSlackMessage({
  //   tokenAddress: tokenCreatedData.tokenAddress,
  //   transactionHash: tokenCreatedData.transactionHash,
  //   tokenName: tokenCreatedData.tokenName,
  //   tokenSymbol: tokenCreatedData.symbol,
  //   deployerContractAddress: tokenCreatedData.deployerContractAddress,
  //   source: 'handle-delegated-clanker-deployer',
  //   tokenScoreDetails: null
  // });
  console.log(
    `Unsupported deployment source ${deploymentSource} with token ${JSON.stringify(tokenCreatedData, bigIntReplacer)}`
  );
}
