import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { z } from 'zod';
import { getGliderPortfolioForWireTapAccount } from '@wiretap/db';
import { TRPCError } from '@trpc/server';

export interface GliderPortfolioActivity {
  id: string;
  type: 'deposit' | 'withdraw';
  /** {address}:{chainID} */
  assetId: string;
  symbol: string;
  decimals: number;
  /** eth i.e. 0.00001. Negative if withdrawal */
  amount: string;
  /** wei i.e. 10000000000000 */
  rawAmount: string;
  priceUsd: string;
  valueUsd: string;
  txHash: string;
  chainId: number;
  blockNumber: number;
  timestamp: string;
  walletAddress: string;
}

/** Raw response type from Glider API */
export interface GliderPortfolioTradeResponse {
  id: string;
  tradeType: 'swap';
  timestamp: string;
  swaps: GliderPortfolioSwap[];
}

/** Parsed to standardise 'type' field */
export interface GliderPortfolioTrade extends GliderPortfolioTradeResponse {
  type: 'trade';
}

export interface GliderPortfolioSwap {
  type: 'fromToken' | 'toToken';
  /** {address}:{chainID} */
  assetId: string;
  symbol: string;
  amount: number;
  amountRaw: string;
  decimals: number;
  priceUsd: number;
  valueUsd: number;
  transactionHash: string;
}

export type GliderPortfolioTradeOrActivity =
  | GliderPortfolioActivity
  | GliderPortfolioTrade;

interface SuccessResponse {
  success: true;
  data: {
    trades: GliderPortfolioTradeResponse[];
    activity: GliderPortfolioActivity[];
  };
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    correlationId: string;
    requestId: string;
    timestamp: string;
  };
}

export const getGliderPortfolioAnalysisData = privateProcedure
  .input(
    z.object({
      portfolioId: z.string()
    })
  )
  .query(
    async ({
      ctx,
      input: { portfolioId }
    }): Promise<GliderPortfolioTradeOrActivity[]> => {
      const { wireTapAccountId, db } = ctx;

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
        `https://api.glider.fi/v1/portfolio/ao04x0r6`,
        {
          method: 'GET',
          headers: {
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          }
        }
      );

      const portfolioAnalysisData: SuccessResponse | ErrorResponse =
        await portfolioAnalysisResponse.json();

      if (!portfolioAnalysisData.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch portfolio analysis data for Glider Portfolio: ${portfolioAnalysisData.error.message} | code: ${portfolioAnalysisData.error.code}`
        });
      }

      const activities = portfolioAnalysisData.data.activity;
      const trades = portfolioAnalysisData.data.trades;

      const depositAndWithdrawals = activities.filter(
        (activity) =>
          activity.type === 'deposit' || activity.type === 'withdraw'
      );

      const tradesWithType: GliderPortfolioTrade[] = trades.map((trade) => ({
        ...trade,
        type: 'trade'
      }));

      const allTradesDepositsAndWithdrawals = [
        ...depositAndWithdrawals,
        ...tradesWithType
      ];

      const allChronologicalActivities = allTradesDepositsAndWithdrawals.sort(
        (a, b) => {
          return (
            new Date(a.timestamp).getTime() + new Date(b.timestamp).getTime()
          );
        }
      );

      return allChronologicalActivities;
    }
  );
