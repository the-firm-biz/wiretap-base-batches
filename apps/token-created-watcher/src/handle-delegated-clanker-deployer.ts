import { getTokenDeploymentSource } from './get-token-deployment-source.js';
import { handleClankerFarcaster } from './handle-clanker-farcaster.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { getTokenContext } from './get-token-context.js';
import { bigIntReplacer, type Context, trace } from '@wiretap/utils/shared';

export async function handleDelegatedClankerDeployer(
  { tracing: { parentSpan } = {} }: Context,
  tokenCreatedData: TokenCreatedOnChainParams
) {
  const tokenContext = await getTokenContext(tokenCreatedData.transactionHash);

  const deploymentSource = getTokenDeploymentSource({
    tokenContextInterface: tokenContext.interface,
    platform: tokenContext.platform
  });

  if (deploymentSource === 'clanker_farcaster') {
    await trace(
      (contextSpan) =>
        handleClankerFarcaster(
          { tracing: { parentSpan: contextSpan } },
          tokenCreatedData,
          {
            fid: Number(tokenContext.id),
            messageId: tokenContext.messageId
          }
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
