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
import {  RebalancesLogLabel } from '@wiretap/utils/server';
import { portfolioExecuteTransaction } from '../glider-api/portfolio-execute-transaction.js';
import type { SuccessAware } from '../glider-api/types.js';
import { bigIntReplacer } from '@wiretap/utils/shared';

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
          { name: 'deadline', type: 'uint256' },
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

const DEADLINE_SECONDS = 60;

type ExecuteRebalanceWithCallDataParams = {
  portfolioId: string,
  rebalanceId: number;
  tokenAddress: Address;
  recipient: Address;
  amountInWei: bigint;
};

export async function executeRebalanceWithCallData(
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
    deadline: BigInt(Math.floor(Date.now() / 1_000) + DEADLINE_SECONDS),
    amountIn: amountInWei,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  };

  console.log(JSON.stringify(params, bigIntReplacer, 2))

  const calldata = encodeFunctionData({
    abi: swapRouterAbi,
    functionName: 'exactInputSingle',
    args: [params]
  });

  const txPayload = {
    to: '0x2626664c2603336E57B271c5C0b26F421741e481' as Address,
    value: amountInWei.toString(), // wrap-and-swap: ETH sent with the call
    data: calldata
  };

  const executeTxResponse = await portfolioExecuteTransaction(portfolioId, txPayload);

  console.log(JSON.stringify(executeTxResponse, null, 2));

  const success =
    executeTxResponse && (executeTxResponse as SuccessAware).success;

  if (!success) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: RebalancesLogLabel.TRIGGER_VIA_TX_FAILED,
      response: executeTxResponse
    });
    throw new Error(RebalancesLogLabel.TRIGGER_VIA_TX_FAILED.toString());
  }
  throw Error('TEST RUN');
  // const gliderRebalanceId = executeTxResponse.data.rebalanceId;
  // await insertGliderPortfolioRebalanceLog(db, {
  //   gliderPortfolioRebalancesId: rebalanceId,
  //   label: RebalancesLogLabel.TRIGGERED_VIA_TX,
  //   response: executeTxResponse,
  //   gliderRebalanceId
  // });
}
