import {
  insertGliderPortfolioRebalanceLog,
  singletonDb,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { env } from '../../env.js';
import { updatePortfolioAssetsRatio } from './update-portfolio-assets-ratio.js';
import { createPortfolioRebalance } from './create-portfolio-rebalance.js';
import { triggerPortfolioRebalance } from './trigger-portfolio-rebalance.js';
import { monitorRebalance } from './monitor-rebalance.js';
import { withdrawTokenFromPortfolio } from './withdraw-token-from-portfolio.js';
import { type Address, erc20Abi } from 'viem';
import { callWithBackOff, RebalancesLogLabel } from '@wiretap/utils/server';
import { httpPublicClient } from '../../rpc-clients.js';
import { executeRebalanceWithCallData } from './execute-rebalance-with-calldata.js';
import { CURRENCY_ADDRESSES } from '@wiretap/config';

type BuyAmounts = {
  tokenPercentageBps: number;
  ethBalance: bigint;
  buyAmountInWei: bigint;
};

export async function processBuyWithGlider(
  { ethBalance: balance, tokenPercentageBps, buyAmountInWei }: BuyAmounts,
  tokenBuyerPortfolio: TokenBuyerPortfolio,
  poolAddress: Address
): Promise<void> {
  const { portfolio, token, account } = tokenBuyerPortfolio;
  if (!portfolio) {
    console.error(`No portfolio for ${JSON.stringify(tokenBuyerPortfolio)}`);
    return;
  }

  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const rebalanceId = await createPortfolioRebalance(db, {
    balance,
    tokenPercentageBps,
    portfolioId: portfolio.wireTapId,
    tokenId: token.id
  });

  try {
    await updatePortfolioAssetsRatio(db, {
      rebalanceId,
      tokenPercentageBps,
      tokenAddress: token.address as Address,
      portfolioId: portfolio.portfolioId,
      accountEntityAddress: account.accountEntityAddress as Address
    });

    const wethBalance = await callWithBackOff(
      () =>
        httpPublicClient.readContract({
          address: CURRENCY_ADDRESSES['WETH'],
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [poolAddress]
        }),
      undefined,
      {
        name: `get weth balance on pool ${poolAddress}`
      }
    );


    if (!wethBalance || wethBalance === 0n) {
      const txWorkflow = await executeRebalanceWithCallData(db, {
        portfolioId: portfolio.portfolioId,
        rebalanceId,
        amountInWei: buyAmountInWei,
        tokenAddress: token.address as Address,
        recipient: portfolio.address as Address
        }
      );
      console.log(txWorkflow);
    } else {
      const gliderRebalanceId = await triggerPortfolioRebalance(
        db,
        rebalanceId,
        portfolio.portfolioId
      );
      const gliderRebalanceResult = await monitorRebalance(
        db,
        rebalanceId,
        gliderRebalanceId,
        portfolio.portfolioId
      );
      console.log(gliderRebalanceResult);
    }

    await withdrawTokenFromPortfolio(db, {
      rebalanceId,
      tokenAddress: token.address as Address,
      portfolioAddress: portfolio.address as Address,
      portfolioId: portfolio.portfolioId
    });
  } catch (error) {
    console.log(`Error during buy with glider flow ${JSON.stringify(error)}`);
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: RebalancesLogLabel.ERROR
    });
  } finally {
    try {
      // set portfolio back to 100% ETH
      await updatePortfolioAssetsRatio(db, {
        rebalanceId,
        tokenPercentageBps: 0,
        portfolioId: portfolio.portfolioId,
        accountEntityAddress: account.accountEntityAddress as Address
      });
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        label: RebalancesLogLabel.SET_FULL_ETH
      });
    } catch (error) {
      console.log(`ERROR_SET_FULL_ETH ${error}`);
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        label: RebalancesLogLabel.ERROR_SET_FULL_ETH
      });
    }
  }
}
