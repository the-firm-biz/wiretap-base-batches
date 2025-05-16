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

export interface GliderPortfolioSwapActivity {
  id: string;
  // assumed type
  type: 'swap';
}

export type GliderPortfolioSwapsAndActivities =
  | GliderPortfolioActivity
  | GliderPortfolioSwapActivity;

interface SuccessGetPortfolioDataResponse {
  success: true;
  data: {
    trades: any[];
    activity: GliderPortfolioActivity[];
  };
}

interface ErrorGetPortfolioDataResponse {
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
    }): Promise<GliderPortfolioSwapsAndActivities[]> => {
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
        `https://api.glider.fi/v1/portfolio/${portfolioId}`,
        {
          method: 'GET',
          headers: {
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          }
        }
      );

      const portfolioAnalysisData:
        | SuccessGetPortfolioDataResponse
        | ErrorGetPortfolioDataResponse =
        await portfolioAnalysisResponse.json();

      if (!portfolioAnalysisData.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch portfolio analysis data for Glider Portfolio: ${portfolioAnalysisData.error.message} | code: ${portfolioAnalysisData.error.code}`
        });
      }

      // @todo activity feed - get swaps data, add to chronological array of activity items

      return portfolioAnalysisData.data.activity;
    }
  );
