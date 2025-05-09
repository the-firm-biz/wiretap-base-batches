import { privateProcedure } from '@/server/api/trpc';
import { serverEnv } from '@/serverEnv';
import { z } from 'zod';

export interface GliderDepositCallData {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any[];
}

interface GliderDepositCallDataResponse {
  data: GliderDepositCallData;
}

export const getGliderDepositCallData = privateProcedure
  .input(
    z.object({
      portfolioId: z.string()
    })
  )
  .query(
    async ({ ctx, input: { portfolioId } }): Promise<GliderDepositCallData> => {
      const { authedAddress } = ctx;

      const depositResponse = await fetch(
        `https://api.glider.fi/v1/portfolio/${portfolioId}/deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serverEnv.GLIDER_API_KEY
          },
          body: JSON.stringify({
            amount: '1000000000000000000', // 1 ETH in wei
            tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
            chainId: 8453, // Base
            senderAddress: authedAddress
          })
        }
      );

      const depositCallData =
        (await depositResponse.json()) as GliderDepositCallDataResponse;

      console.log(depositCallData);

      return depositCallData.data;
    }
  );
