import { type OpStackTransaction } from 'viem/chains';
import { CLANKER_3_1_ADDRESS } from '@wiretap/config';
import { isAddressEqual } from '@wiretap/utils/shared';
import { isClankerV3_1DeployTokenTx } from './is-clanker-v3-1-deploy-token-tx.js';
import { isUniswapV3SwapTx } from './is-uniswap-v3-swap-tx.js';

type WiretapService =
  | 'clanker_v3_1_deploy_token_handler'
  | 'uniswap_v3_swap_handler';

type ServiceTransactionMap = Record<WiretapService, OpStackTransaction[]>;

/**
 * Groups transactions by Wiretap service (e.g. Clanker 3.1, Uniswap V3)
 */
export function groupTransactionsByService(
  transactions: OpStackTransaction[]
): ServiceTransactionMap {
  return transactions.reduce(
    (acc, tx) => {
      /** CLANKER 3.1 */
      if (isAddressEqual(tx.to, CLANKER_3_1_ADDRESS)) {
        if (isClankerV3_1DeployTokenTx(tx)) {
          acc.clanker_v3_1_deploy_token_handler.push(tx);
        }
      }

      /** UNISWAP V3 */
      // if (isUniswapV3SwapTx(tx)) {
      //   acc.uniswap_v3_swap_handler.push(tx);
      // }

      return acc;
    },
    {
      clanker_v3_1_deploy_token_handler: [],
      uniswap_v3_swap_handler: []
    } as ServiceTransactionMap
  );
}
