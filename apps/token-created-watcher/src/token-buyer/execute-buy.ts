import type { BuyTrigger } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, parseEther } from 'viem';
import { processBuyWithGlider } from './glider-api/process-buy-with-glider.js';

const BALANCE_TRADE_THRESHOLD: bigint = parseEther('0.0001', 'wei');
const TOKEN_PERCENTAGE_THRESHOLD: number = 0;

export async function executeBuy(buyTrigger: BuyTrigger): Promise<void> {
  const { portfolio } = buyTrigger;
  if (!portfolio) {
    console.error(`No portfolio for ${JSON.stringify(buyTrigger)}`);
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

  const tokenPercentage = computeBaseAssetPercentage(
    buyTrigger.maxSpend,
    balance
  );
  const isRebalanceReasonable = tokenPercentage > TOKEN_PERCENTAGE_THRESHOLD;
  if (!isRebalanceReasonable) {
    console.error(
      `Rebalance is not reasonable for ${tokenPercentage} percentage for ${JSON.stringify(
        {
          portfolio: portfolio.address,
          balance: balance,
          maxSpend: buyTrigger.maxSpend
        }
      )}`
    );
    return;
  }

  await processBuyWithGlider(tokenPercentage, balance, buyTrigger);
}

function roundUpToTwoDecimals(num: number): number {
  return Math.ceil(num * 100) / 100;
}

function computeBaseAssetPercentage(maxSpend: number, balance: bigint) {
  const ratio = Number((BigInt(maxSpend) * 10000n) / balance) / 10000;
  const percent = roundUpToTwoDecimals(ratio * 100);
  return Math.min(percent, 100);
}