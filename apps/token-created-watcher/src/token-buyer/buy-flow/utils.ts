import type { SuccessAware } from '../glider-api/types.js';

export function isSuccess(rawResponse: string | undefined): boolean {
  if (!rawResponse) {
    return false;
  }
  try {
    const updatedPortfolioResponse = JSON.parse(rawResponse);
    return (updatedPortfolioResponse as SuccessAware)?.success ?? false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}
