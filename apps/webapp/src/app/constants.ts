import { parseEther } from 'viem';

// @TODO release - update to 0.0001
export const MIN_GLIDER_REBALANCE_AMOUNT_ETH = 0.00001; // Glider will not rebalance trades lower that $0.50
// The minimal portfolio balance under which it doesn't make sense to trigger a rebalance.
export const MIN_REBALANCE_LIMIT_WEI = parseEther(
  MIN_GLIDER_REBALANCE_AMOUNT_ETH.toString()
);
