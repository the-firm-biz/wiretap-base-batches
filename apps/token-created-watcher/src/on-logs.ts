import { type WatchContractEventOnLogsParameter } from 'viem';
import {
  type ClankerAbi,
  DELEGATED_CLANKER_DEPLOYER_ADDRESSES
} from '@wiretap/config';
import { isAddressEqual } from '@wiretap/utils/shared';
import { handleDelegatedClankerDeployer } from './handle-delegated-clanker-deployer.js';
import { handleEOAMsgSender } from './handle-eoa-msg-sender.js';
import { deconstructLog, type TokenCreatedLog } from './types/token-created.js';

export function onLogs(
  logs: WatchContractEventOnLogsParameter<ClankerAbi, 'TokenCreated', true>
) {
  // @todo parallelize in case multiple logs are returned
  logs.forEach(async (log: TokenCreatedLog) => {
    await onLog(log);
  });
}

export async function onLog(log: TokenCreatedLog) {
  const onChainToken = deconstructLog(log);

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
