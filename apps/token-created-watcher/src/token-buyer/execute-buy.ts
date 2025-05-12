import type { BuyTrigger } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, parseEther } from 'viem';
import { updatePortfolio } from './glider-api/update-portfolio.js';

const BALANCE_TRADE_THRESHOLDS: bigint = parseEther('0.0001', 'wei');

export async function executeBuy(buyTrigger: BuyTrigger): Promise<void> {
  if (!buyTrigger.portfolioId || !buyTrigger.portfolioAddress) {
    console.log(`No portfolio for ${JSON.stringify(buyTrigger)}`);
    return;
  }

  const balance = await callWithBackOff(
    () =>
      httpPublicClient.getBalance({
        address: buyTrigger.portfolioAddress as Address,
        blockTag: 'latest'
      }),
    `getBalance for portfolio ${buyTrigger.portfolioAddress}`
  );
  const isBalanceSufficient = balance && balance >= BALANCE_TRADE_THRESHOLDS;
  if (!isBalanceSufficient) {
    console.log(
      `Insufficient portfolio balance ${buyTrigger.portfolioAddress}`
    );
    return;
  }

  const baseAssetPercentage =
    computeBaseAssetRation(buyTrigger.maxSpend, balance) * 100;

  const updatedResult = await updatePortfolio({
    accountEntityAddress: buyTrigger.accountEntityAddress,
    portfolioId: buyTrigger.portfolioId,
    tokenAddress: buyTrigger.tokenAddress as Address,
    tokenPercentage: baseAssetPercentage}
  );
}

function computeBaseAssetRation(maxSpend: number, balance: bigint) {
  const ratio = Number((BigInt(maxSpend) * 100n) / balance) / 100;
  return Math.min(ratio, 1);
}
