import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { z } from 'zod';
import { getGliderPortfolioForWireTapAccount } from '@wiretap/db';
import { TRPCError } from '@trpc/server';
import { Address } from 'viem';

interface SuccessWithdrawResponse {
  success: true;
  data: {
    withdrawId: string;
    workflowId: string;
    runId: string;
    message: string; // i.e. 'Withdraw request submitted successfully'
    status: string; // i.e. 'submitted'
  };
}

interface ErrorWithdrawResponse {
  success: false;
  error: {
    message: string;
    code: string;
    correlationId: string;
    requestId: string;
    timestamp: string;
  };
}

type WithdrawResponse = SuccessWithdrawResponse | ErrorWithdrawResponse;

export const getGliderPortfolioAnalysisData = privateProcedure
  .input(
    z.object({
      portfolioId: z.string()
    })
  )
  .mutation(
    async ({
      ctx,
      input: { portfolioId }
    }): Promise<SuccessWithdrawResponse> => {
      const { wireTapAccountId, db, viemClient } = ctx;

      if (!serverEnv.GLIDER_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'GLIDER_API_KEY is not set'
        });
      }

      // Validate that the portfolio exists & the authed address is the owner
      const existingGliderPortfolio = await getGliderPortfolioForWireTapAccount(
        db,
        wireTapAccountId
      );
      if (!existingGliderPortfolio) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Glider Portfolio does not exist for this WireTapAccount id'
        });
      }
      if (existingGliderPortfolio.wireTapAccountId !== wireTapAccountId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not the owner of this Glider Portfolio'
        });
      }

      const portfolioAnalysisResponse = await fetch(
        `https://api.glider.fi/v1/portfolio/${portfolioId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          }
        }
      );

      const portfolioAnalysisData = await portfolioAnalysisResponse.json();

      //   portfolioAnalysisData.data.activity.forEach((activity) => {
      //     console.log(
      //       `${activity.type} of ${activity.amount} ${activity.symbol} at ${activity.timestamp}`
      //     );
      //     console.log(
      //       `  Value: $${activity.valueUsd}, Transaction: ${activity.txHash}`
      //     );
      //   });

      //   portfolioAnalysisData.data.trades.forEach((trade) => {
      //     console.log(
      //       `Trade: ${trade.tradeDirection} at ${new Date(trade.timestamp).toLocaleString()}`
      //     );
      //     console.log(
      //       `  P&L: $${trade.totalProfitLossUsd} (${trade.totalProfitLossPercent.toFixed(2)}%)`
      //     );
      //     console.log(
      //       `  Sold: $${trade.totalSellValueUsd}, Bought: $${trade.totalBuyValueUsd}`
      //     );

      //     // Each trade contains individual swap components
      //     trade.swaps.forEach((swap) => {
      //       if (swap.type === 'fromToken') {
      //         console.log(
      //           `  Sold ${swap.amount} ${swap.symbol} ($${swap.valueUsd})`
      //         );
      //       } else if (swap.type === 'toToken') {
      //         console.log(
      //           `  Bought ${swap.amount} ${swap.symbol} ($${swap.valueUsd})`
      //         );
      //       }
      //     });
      //   });

      console.log(portfolioAnalysisResponse);

      //   if (!portfolioAnalysisData.success) {
      //     throw new TRPCError({
      //       code: 'INTERNAL_SERVER_ERROR',
      //       message: `Failed to fetch portfolio analysis data for Glider Portfolio: ${withdrawResult.error.message} | code: ${withdrawResult.error.code}`
      //     });
      //   }

      return true;
    }
  );
