import { type OpStackTransaction } from 'viem/chains';
import type { Log } from 'viem';
import { isUniswapV3SwapLog } from './log-filters/is-uniswap-v3-swap-log.js';
import { isClankerV3_1TokenCreatedLog } from './log-filters/is-clanker-v3-1-token-created-log.js';

type WiretapService =
  | 'clanker_v3_1_deploy_token_handler'
  | 'uniswap_v3_swap_handler';

export type TransactionLogPair = {
  transaction: OpStackTransaction;
  log: Log;
};

export type ServiceTransactionLogMap = Record<
  WiretapService,
  TransactionLogPair[]
>;

/**
 * Groups transaction-log pairs by WireTap service based on an array of logs
 * Returns both the transaction and the corresponding log for each match
 */
export function groupTransactionLogPairsByService(
  transactions: OpStackTransaction[],
  logs: Log[]
): ServiceTransactionLogMap {
  return logs.reduce(
    (acc, log) => {
      /** CLANKER 3.1 TokenCreated */
      if (isClankerV3_1TokenCreatedLog(log)) {
        const transactionForLog = transactions.find(
          (tx) => tx.hash === log.transactionHash
        );
        if (!transactionForLog) {
          console.error('TX NOT FOUND FOR CLANKER 3.1 LOG');
          console.error('log>>>', log);
          console.error(
            'tx hashes>>>',
            transactions.map((tx) => tx.hash)
          );
          return acc;
        }
        acc.clanker_v3_1_deploy_token_handler.push({
          transaction: transactionForLog,
          log
        });
      }

      /** UNISWAP V3 Swap */
      if (isUniswapV3SwapLog(log)) {
        const transactionForLog = transactions.find(
          (tx) => tx.hash === log.transactionHash
        );
        if (!transactionForLog) {
          console.error('TX NOT FOUND FOR UNISWAP V3 LOG');
          console.error('log>>>', log);
          console.error(
            'tx hashes>>>',
            transactions.map((tx) => tx.hash)
          );
          return acc;
        }
        acc.uniswap_v3_swap_handler.push({
          transaction: transactionForLog,
          log
        });
      }

      return acc;
    },
    {
      clanker_v3_1_deploy_token_handler: [],
      uniswap_v3_swap_handler: []
    } as ServiceTransactionLogMap
  );
}
