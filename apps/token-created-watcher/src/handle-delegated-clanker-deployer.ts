import { getTokenDeploymentSource } from './get-token-deployment-source.js';
import { handleClankerFarcaster } from './handle-clanker-farcaster.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { getTokenContext } from './get-token-context.js';
import { sendSlackMessage } from './notifications/send-slack-message.js';

export async function handleDelegatedClankerDeployer(
  tokenCreatedData: TokenCreatedOnChainParams
) {
  const tokenContext = await getTokenContext(tokenCreatedData.transactionHash);

  const deploymentSource = getTokenDeploymentSource({
    tokenContextInterface: tokenContext.interface,
    platform: tokenContext.platform
  });

  if (deploymentSource === 'clanker_farcaster') {
    await handleClankerFarcaster(tokenCreatedData, {
      fid: Number(tokenContext.id),
      messageId: tokenContext.messageId
    });
    return;
  }

  sendSlackMessage({
    tokenAddress: tokenCreatedData.tokenAddress,
    transactionHash: tokenCreatedData.transactionHash,
    tokenName: tokenCreatedData.tokenName,
    tokenSymbol: tokenCreatedData.symbol,
    deployerContractAddress: tokenCreatedData.deployerContractAddress,
    source: 'handle-delegated-clanker-deployer',
    tokenScoreDetails: null
  });
}
