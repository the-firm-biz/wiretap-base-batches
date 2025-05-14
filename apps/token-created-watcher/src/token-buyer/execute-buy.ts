import type { BuyTrigger } from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { httpPublicClient } from '../rpc-clients.js';
import { type Address, parseEther } from 'viem';
import { updatePortfolio } from './glider-api/update-portfolio.js';
import { triggerRebalancePortfolio } from './glider-api/trigger-rebalance-portfolio.js';
import type { GliderRebalanceStatus, SuccessAware } from './glider-api/types.js';
import { rebalanceStatus } from './glider-api/rebalance-status.js';

const BALANCE_TRADE_THRESHOLD: bigint = parseEther('0.0001', 'wei');
const TOKEN_PERCENTAGE_THRESHOLD: number = 0;

export async function executeBuy(buyTrigger: BuyTrigger): Promise<void> {
  const { portfolio, account, token } = buyTrigger;
  if (!portfolio) {
    console.log(`No portfolio for ${JSON.stringify(buyTrigger)}`);
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
    console.log(`Insufficient portfolio balance ${portfolio.address}`);
    return;
  }

  const tokenPercentage =
    computeBaseAssetRation(buyTrigger.maxSpend, balance) * 100;
  const isRebalanceReasonable = tokenPercentage > TOKEN_PERCENTAGE_THRESHOLD;
  if (!isRebalanceReasonable) {
    console.log(
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

  // 1. update portfolio
  // todo: insert rebalance and set CREATED
  const updateRawResponse = await updatePortfolio({
    accountEntityAddress: account.accountEntityAddress,
    portfolioId: portfolio.portfolioId,
    tokenAddress: token.address as Address,
    tokenPercentage
  });
  if (!isSuccess(updateRawResponse)) {
    // todo: FAILED with updateRawResponse
    return;
  }
  // todo: UPDATED

  try {
    // 2. trigger rebalance
    const rebalanceRawResponse = await callWithBackOff(
      () => triggerRebalancePortfolio(portfolio.portfolioId),
      {
        startingDelay: 100,
        timeMultiple: 1.3
      },
      {
        name: `rebalance portfolio ${portfolio.address}`
      }
    );
    if (!isSuccess(rebalanceRawResponse)) {
      // todo: FAILED with updateRawResponse
      return;
    }
    const rebalanceId = 'CHANGE_ME';
    // todo: PENDING with rebalanceId

    // 3. pull status
    const rebalanceStatusResponse = await callWithBackOff(
      async () => {
        const statusResponse = await rebalanceStatus(portfolio.portfolioId, rebalanceId)
        const gliderRebalanceStatus = JSON.parse(statusResponse) as GliderRebalanceStatus;
        if (gliderRebalanceStatus.data.status === 'running') {
          throw new Error('still running')
        }
        return gliderRebalanceStatus;
      },
      {
        startingDelay: 400,
        timeMultiple: 1.3
      },
      {
        name: `rebalance status ${rebalanceId} portfolio ${portfolio.address}`
      }
    );
    if (!rebalanceStatusResponse || rebalanceStatusResponse.data.status !== 'completed') {
      // todo: FAILED
      return
    }
    // todo: mark REBALANCED

    // 4. withdraw
    const requestWithdrawResponse = await callWithBackOff(
      () => triggerRebalancePortfolio(portfolio.portfolioId),
      {
        startingDelay: 100,
        timeMultiple: 1.3
      },
      {
        name: `rebalance portfolio ${portfolio.address}`
      }
    );
    if (!isSuccess(requestWithdrawResponse)) {
      // todo: FAILED_WITHDRAW_REQUEST with updateRawResponse
      return;
    }
    const workflowId = 'CHANGE_ME_2';
    // todo: PENDING with rebalanceId

    // TODO: is there a way to see workflowId status

  } finally {
    // set portfolio back to 100% ETH
    await updatePortfolio({
      accountEntityAddress: account.accountEntityAddress,
      portfolioId: portfolio.portfolioId
    })
  }
}

function computeBaseAssetRation(maxSpend: number, balance: bigint) {
  const ratio = Number((BigInt(maxSpend) * 100n) / balance) / 100;
  return Math.min(ratio, 1);
}

function isSuccess(rawResponse: string | undefined): boolean {
  console.log(rawResponse)
  if (!rawResponse) {
    return false;
  }
  try {
    const updatedPortfolioResponse = JSON.parse(rawResponse);
    return (updatedPortfolioResponse as SuccessAware)?.success ?? false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}
