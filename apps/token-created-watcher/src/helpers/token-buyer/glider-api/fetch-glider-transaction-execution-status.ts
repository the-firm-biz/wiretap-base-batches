import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

// status will be one of: "running", "completed", "failed", "canceled", or "terminated"
export type GliderTransactionExecutionStatus = SuccessAware & {
  data: {
    status: string;
    result: {
      success: boolean;
      hash: string
    }
  }
}

export async function fetchGliderTransactionExecutionStatus(portfolioId: string, executionId: string): Promise<GliderTransactionExecutionStatus> {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/execute/status/${executionId}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      }
    }
  );
  return await result.json() as GliderTransactionExecutionStatus;
}
