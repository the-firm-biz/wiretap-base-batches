import type { TokenBuyerPortfolio } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, formatEther, parseEther } from 'viem';
import { processBuyWithGlider } from './glider-api/process-buy-with-glider.js';
import { bigIntReplacer } from '@wiretap/utils/shared';

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

  const tokenPercentageTwoDecimals = computeBaseAssetPercentageTwoDecimals(
    tokenBuyerPortfolio.maxSpend,
    balance
  );
  const tradeAmountWei =
    (BigInt(tokenPercentageTwoDecimals * 100) * balance) / 10000n;
  const isRebalanceReasonable =
    tradeAmountWei > TOKEN_SWAP_ETH_AMOUNT_THRESHOLD;
  if (!isRebalanceReasonable) {
    console.error(
      `Rebalance is not reasonable for ${formatEther(tradeAmountWei)}  (${tokenPercentageTwoDecimals}%) trade; Threshold is ${formatEther(TOKEN_SWAP_ETH_AMOUNT_THRESHOLD)}; ${JSON.stringify(
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

  await processBuyWithGlider(
    tokenPercentageTwoDecimals,
    balance,
    tokenBuyerPortfolio
  );
}

function roundUpToTwoDecimals(num: number): number {
  return Math.ceil(num * 100) / 100;
}

function computeBaseAssetPercentageTwoDecimals(
  maxSpend: number,
  balance: bigint
) {
  const ratio = Number((BigInt(maxSpend) * 10000n) / balance) / 10000;
  const percent = roundUpToTwoDecimals(ratio * 100);
  return Math.min(percent, 100);
}
