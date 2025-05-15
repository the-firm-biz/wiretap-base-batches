import type { TokenBuyerPortfolio } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, formatEther, parseEther } from 'viem';
import { bigIntReplacer } from '@wiretap/utils/shared';
import { processBuyWithGlider } from './buy-flow/process-buy-with-glider.js';

const BPS_MULTIPLIER: number = 10_000;

const BALANCE_TRADE_THRESHOLD: bigint = parseEther('0.0002', 'wei');
const TOKEN_SWAP_ETH_AMOUNT_THRESHOLD: bigint = parseEther('0.0002', 'wei'); // TODO: make USD based

export async function executeBuy(
  tokenBuyerPortfolio: TokenBuyerPortfolio
): Promise<void> {
  const { portfolio } = tokenBuyerPortfolio;
  if (!portfolio) {
    console.error(`No portfolio for ${JSON.stringify(tokenBuyerPortfolio)}`);
    return;
  }

  const balance = await callWithBackOff(
    () =>
      httpPublicClient.getBalance({
        address: portfolio.address as Address,
        blockTag: 'latest'
      }),
    undefined,
    {
      name: `getBalance for portfolio ${portfolio.address}`
    }
  );
  const isBalanceSufficient = balance && balance > BALANCE_TRADE_THRESHOLD;
  if (!isBalanceSufficient) {
    console.error(`Insufficient portfolio balance ${portfolio.address}`);
    return;
  }

  const tokenPercentageBps = computeTokenPercentageBps(
    tokenBuyerPortfolio.maxSpend,
    balance
  );
  const tradeAmountWei =
    (BigInt(tokenPercentageBps) * balance) / BigInt(BPS_MULTIPLIER);
  const isRebalanceReasonable =
    tradeAmountWei > TOKEN_SWAP_ETH_AMOUNT_THRESHOLD;
  if (!isRebalanceReasonable) {
    console.error(
      `Rebalance is not reasonable for ${formatEther(tradeAmountWei)} (${tokenPercentageBps}BPS of balance) trade; Threshold is ${formatEther(TOKEN_SWAP_ETH_AMOUNT_THRESHOLD)}; ${JSON.stringify(
        {
          portfolio: portfolio.address,
          balance: balance,
          maxSpend: tokenBuyerPortfolio.maxSpend
        },
        bigIntReplacer
      )}`
    );
    return;
  }

  await processBuyWithGlider(tokenPercentageBps, balance, tokenBuyerPortfolio);
}

function computeTokenPercentageBps(maxSpend: number, balance: bigint): number {
  const percentageBps = Number(BigInt(maxSpend * BPS_MULTIPLIER) / balance);
  return Math.min(percentageBps, 100 * BPS_MULTIPLIER);
}
