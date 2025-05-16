import type { TokenBuyerPortfolio } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { MIN_TRADE_THRESHOLD_WEI } from '@wiretap/config';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, formatEther, parseEther } from 'viem';
import { bigIntReplacer } from '@wiretap/utils/shared';
import { processBuyWithGlider } from './buy-flow/process-buy-with-glider.js';

const BPS_MULTIPLIER: number = 10_000;
const ROUNDING_DUST = parseEther('0.000001', 'wei');

export async function executeBuy(
  tokenBuyerPortfolio: TokenBuyerPortfolio,
  poolAddress: Address
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
  const isBalanceSufficient = balance && balance >= MIN_TRADE_THRESHOLD_WEI;
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
    tradeAmountWei + ROUNDING_DUST > MIN_TRADE_THRESHOLD_WEI;
  if (!isRebalanceReasonable) {
    console.error(
      `Rebalance is not reasonable for ${formatEther(tradeAmountWei)} (${tokenPercentageBps}BPS of balance) trade; Threshold is ${formatEther(MIN_TRADE_THRESHOLD_WEI)}; ${JSON.stringify(
        {
          portfolio: portfolio.address,
          balance: balance,
          maxSpend: formatEther(BigInt(tokenBuyerPortfolio.maxSpend))
        },
        bigIntReplacer
      )}`
    );
    return;
  }

  await processBuyWithGlider(
    {
      tokenPercentageBps,
      ethBalance: balance,
      buyAmountInWei: tradeAmountWei
    },
    tokenBuyerPortfolio,
    poolAddress
  );
}

function computeTokenPercentageBps(maxSpend: bigint, balance: bigint): number {
  const percentageBps = (maxSpend * BigInt(BPS_MULTIPLIER)) / balance;
  return Math.min(Number(percentageBps), 100 * BPS_MULTIPLIER);
}
