import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import { fetchGliderPortfolioRebalanceStatus } from '../glider-api/fetch-glider-portfolio-rebalance-status.js';

type BackoffRebalanceStatus =
  | 'REBALANCE_FAILED'
  | 'REBALANCE_EXECUTION_FAILURE'
  | 'REBALANCE_COMPLETED'
  | 'REBALANCE_NOT_COMPLETED';

export interface BackoffRebalanceResult {
  status: BackoffRebalanceStatus;
  txHash?: `0x${string}`;
  blockNumber?: number;
}

export async function monitorRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  gliderRebalanceId: string,
  portfolioId: string
) {
  const gliderRebalanceResult: BackoffRebalanceResult | undefined =
    await callWithBackOff(
      async () => {
        const rebalanceStatusResponse =
          await fetchGliderPortfolioRebalanceStatus(
            portfolioId,
            gliderRebalanceId
          );
        if (!rebalanceStatusResponse.success) {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: 'REBALANCE_FAILED',
            response: rebalanceStatusResponse
          });
          return {
            status: 'REBALANCE_FAILED'
          };
        }
        if (rebalanceStatusResponse.data.status === 'running') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: 'REBALANCE_RUNNING',
            response: rebalanceStatusResponse
          });
          throw new Error('REBALANCE_RUNNING'); // to repeat backoff
        }

        if (rebalanceStatusResponse.data.status !== 'completed') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: 'REBALANCE_NOT_COMPLETED',
            response: rebalanceStatusResponse
          });
          return {
            status: 'REBALANCE_NOT_COMPLETED'
          };
        }

        const executionResult =
          rebalanceStatusResponse.data.result.result.executionResult;
        if (executionResult !== 'success') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: 'REBALANCE_EXECUTION_FAILURE',
            response: rebalanceStatusResponse
          });
          return {
            status: 'REBALANCE_EXECUTION_FAILURE'
          };
        }

        const { blockNumber, transactionHash } =
          rebalanceStatusResponse.data.result.result.userOpResults[0].receipt
            .receipt;

        // TODO: GET portfolio/:portfolioId trades.swaps which stats with swap-8453-${blockNumber}-${transactionHash}
        console.log(
          `TODO: GET portfolio/:portfolioId trades.swaps which stats with swap-8453-${blockNumber}-${transactionHash}`
        );

        await insertGliderPortfolioRebalanceLog(db, {
          gliderPortfolioRebalancesId: rebalanceId,
          gliderRebalanceId: gliderRebalanceId,
          label: 'REBALANCE_COMPLETED',
          response: rebalanceStatusResponse
        });

        return {
          status: 'REBALANCE_COMPLETED',
          txHash: transactionHash,
          blockNumber: Number(blockNumber)
        } as BackoffRebalanceResult;
      },
      {
        delayFirstAttempt: true,
        startingDelay: 3000,
        numOfAttempts: 20,
        timeMultiple: 1.3
      },
      {
        name: `rebalance status ${gliderRebalanceId}`
      }
    );

  if (!gliderRebalanceResult) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      gliderRebalanceId: gliderRebalanceId,
      label: 'REBALANCE_BACKOFF_EXHAUSTED'
    });
    throw new Error('REBALANCE_BACKOFF_EXHAUSTED');
  }

  if (gliderRebalanceResult.status !== 'REBALANCE_COMPLETED') {
    throw new Error(gliderRebalanceResult.status);
  }

  return gliderRebalanceResult;
}
