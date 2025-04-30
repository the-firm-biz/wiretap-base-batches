import { backOff } from 'exponential-backoff';
import { throwOnUnknownResult } from './throw-on-unknown-result.js';

export async function callWithBackOff<T>(
  fn: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await backOff(
      async () => {
        const result = await fn();
        return throwOnUnknownResult(result, fn.name);
      },
      {
        retry: (_, attemptNumber) => {
          console.debug(`retry ${attemptNumber} on call ${fn.name}`);
          return true;
        },
        jitter: 'full'
      }
    );
  } catch (error) {
    console.error(`Failed to call with backoff ${fn.name}`, error);
  }
}
