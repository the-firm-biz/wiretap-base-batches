import type { Log } from 'viem';
import { isClankerV3_1TokenCreatedLog } from './is-clanker-v3-1-token-created-log.js';
import { isUniswapV3SwapLog } from './is-uniswap-v3-swap-log.js';

type WiretapService =
  | 'clanker_v3_1_token_created_handler'
  | 'uniswap_v3_swap_handler';

type ServiceLogMap = Record<WiretapService, Log[]>;

/**
 * Groups logs by Wiretap service (e.g. Clanker 3.1 TokenCreated, Uniswap V3 Swap)
 */
export function groupLogsByService(logs: Log[]): ServiceLogMap {
  return logs.reduce(
    (acc, log) => {
      /** CLANKER 3.1 TokenCreated */
      if (isClankerV3_1TokenCreatedLog(log)) {
        acc.clanker_v3_1_token_created_handler.push(log);
      }

      /** UNISWAP V3 Swap */
      if (isUniswapV3SwapLog(log)) {
        acc.uniswap_v3_swap_handler.push(log);
      }

      return acc;
    },
    {
      clanker_v3_1_token_created_handler: [],
      uniswap_v3_swap_handler: []
    } as ServiceLogMap
  );
}
