import { type WatchContractEventOnLogsParameter } from 'viem';
import {
  CLANKER_ABI,
  DELEGATED_CLANKER_DEPLOYER_ADDRESSES
} from '@wiretap/config';
import { isAddressEqual } from '@wiretap/utils/shared';
import { handleDelegatedClankerDeployer } from './handle-delegated-clanker-deployer.js';
import { handleEOAMsgSender } from './handle-eoa-msg-sender.js';

type ClankerAbi = typeof CLANKER_ABI;

export function onLogs(
  logs: WatchContractEventOnLogsParameter<ClankerAbi, 'TokenCreated'>
) {
  // @todo parallelize in case multiple logs are returned
  logs.forEach(async (log) => {
    const {
      args: { tokenAddress, name: tokenName, symbol, msgSender },
      address: deployerContractAddress
    } = log;

    /** Validate log.args */
    if (!tokenAddress || !tokenName || !symbol || !msgSender) {
      // @todo error - handle gracefully
      throw new Error(
        `log.args not returning expected values: ${JSON.stringify(log.args)}`
      );
    }

    /* Known delegated deployers that deploy tokens on behalf of users - so we skip Neynar verification of msgSender */
    const isDelegatedDeployer = Object.values(
      DELEGATED_CLANKER_DEPLOYER_ADDRESSES
    ).some((address) => isAddressEqual(address, msgSender));

    if (isDelegatedDeployer) {
      await handleDelegatedClankerDeployer({
        transactionHash: log.transactionHash,
        tokenAddress,
        deployerContractAddress,
        symbol,
        msgSender
      });
      return;
    }

    await handleEOAMsgSender({
      msgSender,
      tokenAddress,
      tokenName,
      deployerContractAddress,
      symbol,
      transactionHash: log.transactionHash
    });
  });
}
