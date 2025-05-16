import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { callWithBackOff, RebalancesLogLabel } from '@wiretap/utils/server';
import { fetchGliderPortfolioRebalanceStatus } from '../glider-api/fetch-glider-portfolio-rebalance-status.js';

type BackoffRebalanceStatus =
  | RebalancesLogLabel.REBALANCE_FAILED
  | RebalancesLogLabel.REBALANCE_RUNNING
  | RebalancesLogLabel.REBALANCE_NOT_COMPLETED
  | RebalancesLogLabel.REBALANCE_EXECUTION_FAILURE
  | RebalancesLogLabel.REBALANCE_RESULTED_FALSE
  | RebalancesLogLabel.REBALANCE_COMPLETED;

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
            label: RebalancesLogLabel.REBALANCE_FAILED,
            response: rebalanceStatusResponse
          });
          return {
            status: RebalancesLogLabel.REBALANCE_FAILED
          };
        }
        if (rebalanceStatusResponse.data.status === 'running') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: RebalancesLogLabel.REBALANCE_RUNNING,
            response: rebalanceStatusResponse
          });
          throw new Error(RebalancesLogLabel.REBALANCE_RUNNING.toString()); // to repeat backoff
        }

        if (rebalanceStatusResponse.data.status !== 'completed') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: RebalancesLogLabel.REBALANCE_NOT_COMPLETED,
            response: rebalanceStatusResponse
          });
          return {
            status: RebalancesLogLabel.REBALANCE_NOT_COMPLETED
          };
        }

        const dataResult = rebalanceStatusResponse?.data?.result?.success;
        if (!dataResult) {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: RebalancesLogLabel.REBALANCE_RESULTED_FALSE,
            response: rebalanceStatusResponse
          });
          return {
            status: RebalancesLogLabel.REBALANCE_RESULTED_FALSE
          };
        }

        const executionResult =
          rebalanceStatusResponse?.data?.result?.result?.executionResult;
        if (executionResult && executionResult !== 'success') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: RebalancesLogLabel.REBALANCE_EXECUTION_FAILURE,
            response: rebalanceStatusResponse
          });
          return {
            status: RebalancesLogLabel.REBALANCE_EXECUTION_FAILURE
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
          label: RebalancesLogLabel.REBALANCE_COMPLETED,
          response: rebalanceStatusResponse
        });

        return {
          status: RebalancesLogLabel.REBALANCE_COMPLETED,
          txHash: transactionHash,
          blockNumber: Number(blockNumber)
        } as BackoffRebalanceResult;
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        retry: (e: any, attemptNumber: number): boolean => {
          console.log(e);
          return true;
        },
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
      label: RebalancesLogLabel.REBALANCE_BACKOFF_EXHAUSTED
    });
    throw new Error(RebalancesLogLabel.REBALANCE_BACKOFF_EXHAUSTED.toString());
  }

  if (gliderRebalanceResult.status !== RebalancesLogLabel.REBALANCE_COMPLETED) {
    throw new Error(gliderRebalanceResult.status.toString());
  }

  return gliderRebalanceResult;
}
