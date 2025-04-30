import { backOff } from 'exponential-backoff';
import { throwOnUnknownResult } from './throw-on-unknown-result.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function backoff<Fn extends (...args: any[]) => any>(fn: Fn) {
  return async (
    ...args: Parameters<Fn>
  ): Promise<Awaited<ReturnType<Fn>> | undefined> => {
    try {
      return await backOff(() => throwOnUnknownResult(fn)(...args), {
        retry: (_, attemptNumber) => {
          console.debug(`retry ${attemptNumber} on call ${fn.name}`);
          return true;
        },
        jitter: 'full'
      });
    } catch (error) {
      console.error(`Failed to call with backoff ${fn.name}}`, error);
    }
  };
}
