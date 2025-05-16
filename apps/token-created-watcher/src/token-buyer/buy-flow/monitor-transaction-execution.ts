import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { callWithBackOff, RebalancesLogLabel } from '@wiretap/utils/server';
import { fetchGliderTransactionExecutionStatus } from '../glider-api/fetch-glider-transaction-execution-status.js';

type BackoffTransactionExecutionStatus =
  | RebalancesLogLabel.TX_EXECUTION_FAILED
  | RebalancesLogLabel.TX_EXECUTION_RUNNING
  | RebalancesLogLabel.TX_EXECUTION_NOT_COMPLETED
  | RebalancesLogLabel.TX_EXECUTION_RESULTED_FALSE
  | RebalancesLogLabel.TX_EXECUTION_COMPLETED;

export interface BackoffTransactionExecutionResult {
  status: BackoffTransactionExecutionStatus;
  txHash?: `0x${string}`;
}

export async function monitorTransactionExecution(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  executionId: string,
  portfolioId: string
) {
  const transactionExecutionResult = await callWithBackOff(
    async () => {
      const txExecutionResponse = await fetchGliderTransactionExecutionStatus(
        portfolioId,
        executionId
      );

      if (!txExecutionResponse.success) {
        await insertGliderPortfolioRebalanceLog(db, {
          gliderPortfolioRebalancesId: rebalanceId,
          gliderRebalanceId: executionId,
          label: RebalancesLogLabel.TX_EXECUTION_FAILED,
          response: txExecutionResponse
        });
        return {
          status: RebalancesLogLabel.TX_EXECUTION_FAILED
        };
      }
      if (txExecutionResponse.data.status === 'running') {
        await insertGliderPortfolioRebalanceLog(db, {
          gliderPortfolioRebalancesId: rebalanceId,
          gliderRebalanceId: executionId,
          label: RebalancesLogLabel.TX_EXECUTION_RUNNING,
          response: executionId
        });
        throw new Error(RebalancesLogLabel.TX_EXECUTION_RUNNING.toString()); // to repeat backoff
      }
      if (txExecutionResponse.data.status !== 'completed') {
        await insertGliderPortfolioRebalanceLog(db, {
          gliderPortfolioRebalancesId: rebalanceId,
          gliderRebalanceId: executionId,
          label: RebalancesLogLabel.TX_EXECUTION_NOT_COMPLETED,
          response: txExecutionResponse
        });
        return {
          status: RebalancesLogLabel.TX_EXECUTION_NOT_COMPLETED
        };
      }

      const success = txExecutionResponse?.data?.result?.success;
      const txHash = txExecutionResponse?.data?.result?.hash;
      if (!success || !txHash) {
        await insertGliderPortfolioRebalanceLog(db, {
          gliderPortfolioRebalancesId: rebalanceId,
          gliderRebalanceId: executionId,
          label: RebalancesLogLabel.TX_EXECUTION_RESULTED_FALSE,
          response: txExecutionResponse
        });
        return {
          status: RebalancesLogLabel.TX_EXECUTION_RESULTED_FALSE
        };
      }

      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        gliderRebalanceId: executionId,
        label: RebalancesLogLabel.TX_EXECUTION_COMPLETED,
        response: txExecutionResponse
      });

      return {
        status: RebalancesLogLabel.TX_EXECUTION_COMPLETED,
        txHash: txHash
      } as BackoffTransactionExecutionResult;
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
      name: `transaction execution status ${portfolioId} ${executionId}`
    }
  );

  if (!transactionExecutionResult) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      gliderRebalanceId: executionId,
      label: RebalancesLogLabel.TX_EXECUTION_BACKOFF_EXHAUSTED
    });
    throw new Error(RebalancesLogLabel.TX_EXECUTION_BACKOFF_EXHAUSTED.toString());
  }

  if (transactionExecutionResult.status !== RebalancesLogLabel.TX_EXECUTION_COMPLETED) {
    throw new Error(transactionExecutionResult.status.toString());
  }

  return transactionExecutionResult;

}
