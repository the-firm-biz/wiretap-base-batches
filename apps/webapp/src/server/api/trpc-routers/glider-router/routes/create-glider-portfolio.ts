import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { base } from 'viem/chains';
import { z } from 'zod';
import {
  getGliderPortfolioForWireTapAccount,
  createGliderPortfolio as createDbGliderPortfolio,
  GliderPortfolio,
  NewGliderPortfolio
} from '@wiretap/db';
import { TRPCError } from '@trpc/server';

interface GliderCreatePortfolioResponse {
  data: GliderCreatePortfolioData;
}

interface GliderCreatePortfolioData {
  portfolioId: string;
  userAddress: string;
  portfolio: {
    strategyInstanceId: string;
    strategyBlueprintId: string;
    chainIds: number[];
    sessionKeys: {
      [chainId: string]: {
        userAddress: string;
        accountIndex: string;
        portfolioAddress: string;
        chainId: number;
        agentAddress: string;
        sessionKey: string;
      };
    };
    vaults: {
      [chainId: string]: string;
    };
  };
}

export const createGliderPortfolio = privateProcedure
  .input(
    z.object({
      signature: z.string(),
      signatureAction: z.object({
        reason: z.string(),
        type: z.string(),
        message: z.object({
          raw: z.string()
        })
      }),
      agentAddress: z.string(),
      accountIndex: z.string()
    })
  )
  .mutation(
    async ({
      ctx,
      input: { signature, signatureAction, agentAddress, accountIndex }
    }): Promise<GliderPortfolio> => {
      const { authedAddress, wireTapAccountId, db } = ctx;

      if (!serverEnv.GLIDER_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'GLIDER_API_KEY is not set'
        });
      }

      const existingGliderPortfolio = await getGliderPortfolioForWireTapAccount(
        db,
        wireTapAccountId
      );

      if (existingGliderPortfolio) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Glider Portfolio already exists for this WireTapAccount id'
        });
      }

      // @todo jeffrey - glider are creating sdk to help with typing this
      const templateData = {
        name: `WireTap ${authedAddress}`,
        entry: {
          blockType: 'weight',
          weightType: 'specified-percentage',
          weightings: ['100'],
          children: [
            {
              blockType: 'asset',
              assetId: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' // ETH
            }
          ]
        }
      };

      const response = await fetch(
        'https://api.glider.fi/v1/portfolio/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          },
          body: JSON.stringify({
            userAddress: authedAddress,
            chainIds: [base.id],
            signatureAction,
            signature,
            agentAddress,
            accountIndex,
            templateData
          })
        }
      );

      const createPortfolioResponse =
        (await response.json()) as GliderCreatePortfolioResponse;

      const newGliderPortfolio: NewGliderPortfolio = {
        wireTapAccountId,
        portfolioId: createPortfolioResponse.data.portfolioId,
        address:
          createPortfolioResponse.data.portfolio.sessionKeys[base.id]
            .portfolioAddress
      };

      const insertedGliderPortfolio = await createDbGliderPortfolio(
        db,
        newGliderPortfolio
      );

      return insertedGliderPortfolio;
    }
  );
