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

// {
//   @wiretap/webapp:dev:     id: 'swap-8453-30210566-0x34aa087ba1e1d52beb10a81832a3bb6585336e1309d06c276f3eb55169f0ab6c-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:8453-0xc1f4c76e8c5d39da0910c69f8428b710dbbacb07:8453',
//   @wiretap/webapp:dev:     timestamp: '2025-05-14T08:14:39.000Z',
//   @wiretap/webapp:dev:     swaps: [ [Object], [Object] ],
//   @wiretap/webapp:dev:     totalSellValueUsd: 2.62345179186,
//   @wiretap/webapp:dev:     totalBuyValueUsd: 1.7505360970916137,
//   @wiretap/webapp:dev:     totalProfitLossUsd: -0.03430770958000018,
//   @wiretap/webapp:dev:     totalProfitLossPercent: -1.2908507922335306,
//   @wiretap/webapp:dev:     weightedAverageCostBasis: 2657.75950144,
//   @wiretap/webapp:dev:     slippagePercent: -33.27355575874707,
//   @wiretap/webapp:dev:     tradeType: 'swap',
//   @wiretap/webapp:dev:     tradeDirection: 'ETH → WENONE',
//   @wiretap/webapp:dev:     fromCount: 1,
//   @wiretap/webapp:dev:     toCount: 1,
//   @wiretap/webapp:dev:     primaryFromAssetId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:8453',
//   @wiretap/webapp:dev:     primaryToAssetId: '0xc1f4c76e8c5d39da0910c69f8428b710dbbacb07:8453',
//   @wiretap/webapp:dev:     primaryFromSymbol: 'ETH',
//   @wiretap/webapp:dev:     primaryToSymbol: 'WENONE',
//   @wiretap/webapp:dev:     blockNumber: 30210566,
//   @wiretap/webapp:dev:     metadata: {
//   @wiretap/webapp:dev:       entriesCount: 2,
//   @wiretap/webapp:dev:       swapGroupId: 'swap-8453-30210566-0x34aa087ba1e1d52beb10a81832a3bb6585336e1309d06c276f3eb55169f0ab6c-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:8453-0xc1f4c76e8c5d39da0910c69f8428b710dbbacb07:8453',
//   @wiretap/webapp:dev:       swapInCount: 1,
//   @wiretap/webapp:dev:       swapOutCount: 1,
//   @wiretap/webapp:dev:       hasMultipleChains: false,
//   @wiretap/webapp:dev:       chains: [Array]
//   @wiretap/webapp:dev:     }
//   @wiretap/webapp:dev:   }
export interface GliderPortfolioSwapActivity {
  id: string;
  tradeType: 'swap';
  primaryFromAssetId: string;
  primaryToAssetId: string;
  primaryFromSymbol: string;
  primaryToSymbol: string;
  swaps: any[];
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
      // const existingGliderPortfolio = await getGliderPortfolioForWireTapAccount(
      //   db,
      //   wireTapAccountId
      // );
      // if (!existingGliderPortfolio) {
      //   throw new TRPCError({
      //     code: 'BAD_REQUEST',
      //     message: 'Glider Portfolio does not exist for this WireTapAccount id'
      //   });
      // }
      // if (existingGliderPortfolio.wireTapAccountId !== wireTapAccountId) {
      //   throw new TRPCError({
      //     code: 'BAD_REQUEST',
      //     message: 'You are not the owner of this Glider Portfolio'
      //   });
      // }

      const portfolioAnalysisResponse = await fetch(
        // `https://api.glider.fi/v1/portfolio/${portfolioId}`,
        `https://api.glider.fi/v1/portfolio/ao04x0r6`,
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

      console.log(portfolioAnalysisData.data.trades[0].swaps);

      // @todo activity feed - get swaps data, add to chronological array of activity items

      return portfolioAnalysisData.data.activity;
    }
  );
