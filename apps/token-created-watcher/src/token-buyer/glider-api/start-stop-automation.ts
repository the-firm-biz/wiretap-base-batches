import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

export async function startAutomation(
  portfolioId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        runRebalanceImmediately: false, // Optional: Run initial rebalance immediately
      }),
    }
  );

  const responseJson = await response.json();
  if (!(responseJson as SuccessAware).success) {
    console.warn(
      `start automation failed ${JSON.stringify(responseJson)}`
    );
    return false;
  }
  console.debug(
    `automation started ${JSON.stringify(responseJson)}`
  );
  return true;
}

export async function stopAutomation(
  portfolioId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/pause`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        reason: "enough is enough", // Optional reason
      }),
    }
  );

  const responseJson = await response.json();
  if (!(responseJson as SuccessAware).success) {
    console.warn(
      `stop automation failed ${JSON.stringify(responseJson)}`
    );
    return false;
  }
  console.debug(
    `automation stopped ${JSON.stringify(responseJson)}`
  );
  return true;
}
