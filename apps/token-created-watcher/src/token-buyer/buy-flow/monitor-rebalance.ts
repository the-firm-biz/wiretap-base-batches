import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';
import {
  fetchGliderPortfolioRebalanceStatus,
  type GliderRebalanceStatus
} from '../glider-api/fetch-glider-portfolio-rebalance-status.js';
import { isSuccess } from './utils.js';

type BackoffRebalanceStatus = 'REBALANCE_FAILED' | 'REBALANCE_COMPLETED' | 'REBALANCE_NOT_COMPLETED';

export interface BackoffRebalanceResult {
  status: BackoffRebalanceStatus;
  txHash?: `0x${string}`;
  blockNumber?: number;
}

export async function monitorRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  gliderRebalanceId: string,
  { portfolio }: TokenBuyerPortfolio
) {
  const gliderRebalanceResult: BackoffRebalanceResult | undefined =
    await callWithBackOff(
      async () => {
        const rebalanceStatusResponse =
          await fetchGliderPortfolioRebalanceStatus(
            portfolio!.portfolioId,
            gliderRebalanceId
          );
        if (!isSuccess(rebalanceStatusResponse)) {
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
        const gliderRebalanceStatus = JSON.parse(
          rebalanceStatusResponse
        ) as GliderRebalanceStatus;
        if (gliderRebalanceStatus.data.status === 'running') {
          await insertGliderPortfolioRebalanceLog(db, {
            gliderPortfolioRebalancesId: rebalanceId,
            gliderRebalanceId: gliderRebalanceId,
            label: 'REBALANCE_RUNNING',
            response: rebalanceStatusResponse
          });
          throw new Error('REBALANCE_RUNNING'); // to repeat backoff
        }

        if (gliderRebalanceStatus.data.status !== 'completed') {
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

        const {
          blockNumber,
          transactionHash
        } = gliderRebalanceStatus.data.result.result.userOpResults[0].receipt.receipt;

        // TODO: GET portfolio/:portfolioId trades.swaps which stats with swap-8453-${blockNumber}-${transactionHash}
        console.log(`TODO: GET portfolio/:portfolioId trades.swaps which stats with swap-8453-${blockNumber}-${transactionHash}`)

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
        startingDelay: 1000,
        timeMultiple: 1.3,
        retry: (err, n) => {
          console.log(err);
          return true;
        }
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
