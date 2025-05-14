import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { base } from 'viem/chains';
import { z, ZodError } from 'zod';
import {
  getGliderPortfolioForWireTapAccount,
  createGliderPortfolio as createDbGliderPortfolio,
  GliderPortfolio,
  NewGliderPortfolio
} from '@wiretap/db';
import { TRPCError } from '@trpc/server';
import { getBalance } from 'viem/actions';
import { wagmiConfig } from '@/app/components/providers/wallet-provider';
import { Address } from 'viem';

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

interface ErrorResponse {
  result: {
    result: {
      data: {
        error: ZodError;
        sucess: boolean;
      };
    };
  };
}

export const withdrawAllEthFromGliderPortfolio = privateProcedure
  .input(
    z.object({
      portfolioId: z.number()
    })
  )
  .mutation(
    async ({ ctx, input: { portfolioId } }): Promise<GliderPortfolio> => {
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

      // Get ETH in the portfolio
      const balanceToWithdraw = await viemClient.getBalance({
        address: existingGliderPortfolio.address as Address
      });
      if (balanceToWithdraw === BigInt(0)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Glider Portfolio has no balance to withdraw'
        });
      }

      // Withdraw ETH from the portfolio
      const withdrawResponse = await fetch(
        `https://api.glider.fi/v1/portfolio/${portfolioId}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          },
          body: JSON.stringify({
            strategyInstanceId: portfolioId.toString(),
            assets: [
              {
                assetId: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE:8453', // ETH on Base
                amount: balanceToWithdraw.toString(),
                decimals: 18
              }
            ]
          })
        }
      );

      const withdrawResult = await withdrawResponse.json();
      console.log(withdrawResult);

      return withdrawResult;
    }
  );
