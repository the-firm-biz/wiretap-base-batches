import { AllTrpcRouterKeys } from '@/server/api/trpc-routers';

const NON_BATCHABLE_PATHS: AllTrpcRouterKeys[] = [
  'getPopularTargets',
  'targetSearch'
];

/**
 * Determines if a tRPC operation can be batched in a single HTTP request.
 * All operations are batchable by default unless listed in NON_BATCHABLE_PATHS.
 * Non-batchable operations are typically those that rely on cache responses,
 * as batched requests have unpredictable cache behavior.
 */
export const isBatchablePath = (path: string) => {
  return !NON_BATCHABLE_PATHS.includes(path.split('.')[1] as AllTrpcRouterKeys);
};
