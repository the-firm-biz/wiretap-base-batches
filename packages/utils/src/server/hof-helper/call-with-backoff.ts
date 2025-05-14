import {
  backOff,
  type BackoffOptions as ExponentialBackOffOptions,
  type IBackOffOptions
} from 'exponential-backoff';
import { type Context, Span, trace } from '../../shared/index.js';
import * as console from 'node:console';
import { getSanitizedOptions } from 'exponential-backoff/dist/options.js';

export type BackoffOptions = ExponentialBackOffOptions;

export async function callWithBackOff<T>(
  fn: (span: Span) => Promise<T>,
  backoffOptions: BackoffOptions = {},
  { name: contextName, tracing: { parentSpan } = {} }: Context,
): Promise<T | undefined> {
  const sanitizedOptions = getSanitizedOptions(backoffOptions);
  const sanitizedOptionsWithLog: IBackOffOptions = {
    ...sanitizedOptions,
    retry: (e, attemptNumber) => {
      console.debug(
        `${new Date()} retry ${attemptNumber} on call ${contextName}`
      );
      return sanitizedOptions.retry(e, attemptNumber);
    }
  };

  const backoffSpan = new Span(`backoff_${contextName}`);
  try {
    const backOffResult = await backOff(async () => {
      return await trace(
        async (contextSpan) => {
          const fnResult = await fn(contextSpan);
          if (!fnResult) {
            throw new Error(`no result for ${contextName}`);
          }
          return fnResult;
        },
        {
          name: '' + contextName,
          parentSpan: backoffSpan
        }
      );
    }, sanitizedOptionsWithLog);
    backoffSpan.finish('ok');
    return backOffResult;
  } catch (error) {
    backoffSpan.finish('failed');
    console.error(`Failed to call with backoff ${contextName}`, error);
  } finally {
    if (parentSpan) {
      parentSpan.attachChild(backoffSpan);
    }
  }
}
