import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { TRPCError } from '@trpc/server';
import { base } from 'viem/chains';

export interface GliderCreatePortfolioSignatureData {
  userAddress: string;
  signatureAction: {
    reason: string;
    type: string;
    message: {
      raw: string;
    };
  };
  agentAddress: string;
  accountIndex: string;
  chainIds: number[];
  // @todo jeffrey - glider are creating sdk to help with typing this
  permissions: any[];
}

interface GliderCreatePortfolioSignatureResponse {
  data: GliderCreatePortfolioSignatureData;
}

export const getGliderCreatePortfolioSignatureData = privateProcedure.query(
  async ({ ctx }): Promise<GliderCreatePortfolioSignatureData> => {
    const { authedAddress } = ctx;

    if (!serverEnv.GLIDER_API_KEY) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'GLIDER_API_KEY is not set'
      });
    }

    const response = await fetch(
      'https://api.glider.fi/v1/portfolio/create/signature',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': serverEnv.GLIDER_API_KEY
        },
        body: JSON.stringify({
          userAddress: authedAddress, // The wallet that will own the portfolio
          chainIds: [base.id] // Chain IDs where the portfolio will exist
        })
      }
    );

    const createSignatureResponse =
      (await response.json()) as GliderCreatePortfolioSignatureResponse;

    return createSignatureResponse.data;
  }
);
