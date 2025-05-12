import type { BuyTrigger } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, parseEther } from 'viem';
import { updatePortfolio } from './glider-api/update-portfolio.js';
import { rebalancePortfolio } from './glider-api/rebalance-portfolio.js';

const BALANCE_TRADE_THRESHOLDS: bigint = parseEther('0.0001', 'wei');

export async function executeBuy(buyTrigger: BuyTrigger): Promise<void> {
  const { portfolioId, portfolioAddress, accountEntityAddress } = buyTrigger;
  if (!portfolioId || !portfolioAddress) {
    console.log(`No portfolio for ${JSON.stringify(buyTrigger)}`);
    return;
  }

  const balance = await callWithBackOff(
    () =>
      httpPublicClient.getBalance({
        address: portfolioAddress as Address,
        blockTag: 'latest'
      }),
    `getBalance for portfolio ${portfolioAddress}`
  );
  const isBalanceSufficient = balance && balance >= BALANCE_TRADE_THRESHOLDS;
  if (!isBalanceSufficient) {
    console.log(`Insufficient portfolio balance ${portfolioAddress}`);
    return;
  }

  const tokenPercentage =
    computeBaseAssetRation(buyTrigger.maxSpend, balance) * 100;
  const isUpdatedSuccessful = updatePortfolio({
    accountEntityAddress,
    portfolioId,
    tokenAddress: buyTrigger.tokenAddress as Address,
    tokenPercentage
  });

  if (!isUpdatedSuccessful) {
    return;
  }

  const isRebalanceSuccessful = await rebalancePortfolio(portfolioId);
  if (!isRebalanceSuccessful) {
    // TODO: reset back to 100% eth ?!
  }
}

function computeBaseAssetRation(maxSpend: number, balance: bigint) {
  const ratio = Number((BigInt(maxSpend) * 100n) / balance) / 100;
  return Math.min(ratio, 1);
}
