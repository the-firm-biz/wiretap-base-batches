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
import { getTransactionContext } from './get-transaction-context.js';

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
  const { block, args: transactionArgs } = await getTransactionContext(
    log.blockNumber,
    log.transactionHash
  );

  const onChainToken = await deconstructLog(log, transactionArgs, block);

  if (!onChainToken) {
    return;
  }

  /* Known delegated deployers that deploy tokens on behalf of users - so we skip Neynar verification of msgSender */
  const isDelegatedDeployer = Object.values(
    DELEGATED_CLANKER_DEPLOYER_ADDRESSES
  ).some((address) => isAddressEqual(address, onChainToken.msgSender));

  if (isDelegatedDeployer) {
    await handleDelegatedClankerDeployer(onChainToken, transactionArgs);
    return;
  }

  await handleEOAMsgSender(onChainToken, transactionArgs);
}
