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

export const withdrawAllEthFromGliderPortfolio = privateProcedure
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

      const withdrawResult: WithdrawResponse = await withdrawResponse.json();

      if (!withdrawResult.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to withdraw ETH from Glider Portfolio: ${withdrawResult.error.message} | code: ${withdrawResult.error.code}`
        });
      }

      return withdrawResult;
    }
  );
