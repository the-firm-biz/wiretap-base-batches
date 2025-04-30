import { backOff } from 'exponential-backoff';

export async function callWithBackOff<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | undefined> {
  try {
    return await backOff(
      async () => {
        const result = await fn();
        if (!result) {
          throw new Error(`no result for ${context}`);
        }
        return result;
      },
      {
        retry: (_, attemptNumber) => {
          console.debug(`retry ${attemptNumber} on call ${context}`);
          return true;
        },
        jitter: 'full'
      }
    );
  } catch (error) {
    console.error(`Failed to call with backoff ${context}`, error);
  }
}
