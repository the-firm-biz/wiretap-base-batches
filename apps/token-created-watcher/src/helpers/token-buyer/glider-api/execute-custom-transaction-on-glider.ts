import { env } from '../../env.js';
import type { Address } from 'viem';
import type {SuccessAware} from "./types.js";

type TxPayload = {
  to: Address;
  value: string; // wrap-and-swap: ETH sent with the call
  data: string;
};

export type ExecuteTransactionResponse = SuccessAware & {
    data: {
        executionId: string
        simulation: {
            success: boolean;
        }
    }
}

export async function executeCustomTransactionOnGlider(
  portfolioId: string,
  txPayload: TxPayload
) {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        chainId: '8453',
        params: {
          calls: txPayload
        }
      })
    }
  );

  return await result.json() as ExecuteTransactionResponse;
}
