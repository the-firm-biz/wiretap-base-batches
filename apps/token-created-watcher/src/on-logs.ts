import { type WatchContractEventOnLogsParameter } from 'viem';
import {
  type ClankerAbi,
  DELEGATED_CLANKER_DEPLOYER_ADDRESSES
} from '@wiretap/config';
import {
  type Context,
  isAddressEqual,
  Span,
  trace
} from '@wiretap/utils/shared';
import { handleDelegatedClankerDeployer } from './handle-delegated-clanker-deployer.js';
import { handleEOAMsgSender } from './handle-eoa-msg-sender.js';
import { deconstructLog, type TokenCreatedLog } from './types/token-created.js';
import { resetReconnectRetries } from './on-error.js';
import { sendSlackIndexerError } from './notifications/send-slack-indexer-error.js';
import { getTransactionContext } from './get-transaction-context.js';

export function onLogs(
  logs: WatchContractEventOnLogsParameter<ClankerAbi, 'TokenCreated', true>
) {
  resetReconnectRetries();
  // @todo parallelize in case multiple logs are returned
  logs.forEach(async (log: TokenCreatedLog) => {
    const span = new Span(log.address);
    try {
      await onLog(log, { tracing: { parentSpan: span } });
      span.finish('ok');
    } catch (error) {
      span.finish('failed');
      sendSlackIndexerError(error);
    }
  });
}

export async function onLog(log: TokenCreatedLog, ctx: Context) {
  const { tracing: { parentSpan } = {} } = ctx;

  const { block, args: transactionArgs } = await trace(
    (contextSpan) =>
      getTransactionContext(log.blockNumber, log.transactionHash, {
        tracing: { parentSpan: contextSpan }
      }),
    {
      name: 'getTransactionContext',
      parentSpan
    }
  );

  const onChainToken = await trace(
    (contextSpan) =>
      deconstructLog(
        log,
        transactionArgs,
        {
          tracing: { parentSpan: contextSpan }
        },
        block
      ),
    { name: 'deconstructLog', parentSpan }
  );

  if (!onChainToken) {
    return;
  }

  /* Known delegated deployers that deploy tokens on behalf of users - so we skip Neynar verification of msgSender */
  const isDelegatedDeployer = Object.values(
    DELEGATED_CLANKER_DEPLOYER_ADDRESSES
  ).some((address) => isAddressEqual(address, onChainToken.msgSender));

  if (isDelegatedDeployer) {
    await trace(
      (contextSpan) =>
        handleDelegatedClankerDeployer(onChainToken, transactionArgs, {
          tracing: { parentSpan: contextSpan }
        }),
      {
        name: 'handleDelegatedClankerDeployer',
        parentSpan
      }
    );
    return;
  }

  await handleEOAMsgSender(onChainToken, transactionArgs);
}
