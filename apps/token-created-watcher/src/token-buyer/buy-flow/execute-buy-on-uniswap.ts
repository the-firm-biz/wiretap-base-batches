import { type Address, encodeFunctionData } from 'viem';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  CURRENCY_ADDRESSES
} from '@wiretap/config';
import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { RebalancesLogLabel } from '@wiretap/utils/server';
import { executeCustomTransactionOnGlider } from '../glider-api/execute-custom-transaction-on-glider.js';

const swapRouterAbi = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  }
] as const;

type ExecuteRebalanceWithCallDataParams = {
  portfolioId: string;
  rebalanceId: number;
  tokenAddress: Address;
  recipient: Address;
  amountInWei: bigint;
};

export async function executeBuyOnUniswap(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  {
    portfolioId,
    rebalanceId,
    tokenAddress,
    recipient,
    amountInWei
  }: ExecuteRebalanceWithCallDataParams
): Promise<string> {
  const params = {
    tokenIn: CURRENCY_ADDRESSES['WETH'],
    tokenOut: tokenAddress,
    fee: CLANKER_3_1_UNISWAP_FEE_BPS,
    recipient: recipient,
    amountIn: amountInWei,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  };

  const executeTxResponse = await executeCustomTransactionOnGlider(portfolioId, {
    to: '0x2626664c2603336E57B271c5C0b26F421741e481' as Address,
    data: encodeFunctionData({
      abi: swapRouterAbi,
      functionName: 'exactInputSingle',
      args: [params]
    }),
    value: amountInWei.toString() // wrap-and-swap: ETH sent with the call
  });

  const success =
    executeTxResponse &&
    executeTxResponse.success &&
    executeTxResponse.data?.simulation?.success;

  if (!success) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: RebalancesLogLabel.TRIGGER_VIA_TX_FAILED,
      response: executeTxResponse
    });
    throw new Error(RebalancesLogLabel.TRIGGER_VIA_TX_FAILED.toString());
  }

  const gliderExecutionId = executeTxResponse.data?.executionId;
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: RebalancesLogLabel.TRIGGERED_VIA_TX,
    response: executeTxResponse,
    gliderRebalanceId: gliderExecutionId
  });
  return gliderExecutionId;
}
