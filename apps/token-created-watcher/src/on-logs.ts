import { type WatchContractEventOnLogsParameter } from 'viem';
import {
  type ClankerAbi,
  DELEGATED_CLANKER_DEPLOYER_ADDRESSES
} from '@wiretap/config';
import { isAddressEqual } from '@wiretap/utils/shared';
import { handleDelegatedClankerDeployer } from './handle-delegated-clanker-deployer.js';
import { handleEOAMsgSender } from './handle-eoa-msg-sender.js';
import { deconstructLog, type TokenCreatedLog } from './types/token-created.js';
import { resetReconnectReties } from './on-error.js';
import { sendSlackIndexerError } from './notifications/send-slack-indexer-error.js';

export function onLogs(
  logs: WatchContractEventOnLogsParameter<ClankerAbi, 'TokenCreated', true>
) {
  resetReconnectReties();
  // @todo parallelize in case multiple logs are returned
  logs.forEach(async (log: TokenCreatedLog) => {
    try {
      await onLog(log);
    } catch (error) {
      sendSlackIndexerError(error);
    }
  });
}

export async function onLog(log: TokenCreatedLog) {
  const onChainToken = await deconstructLog(log);

  if (!onChainToken) {
    return;
  }

  /* Known delegated deployers that deploy tokens on behalf of users - so we skip Neynar verification of msgSender */
  const isDelegatedDeployer = Object.values(
    DELEGATED_CLANKER_DEPLOYER_ADDRESSES
  ).some((address) => isAddressEqual(address, onChainToken.msgSender));

  if (isDelegatedDeployer) {
    await handleDelegatedClankerDeployer(onChainToken);
    return;
  }

  await handleEOAMsgSender(onChainToken);
}
