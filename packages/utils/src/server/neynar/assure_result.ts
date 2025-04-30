/* eslint-disable @typescript-eslint/no-explicit-any */
export async function assureResult<Args extends any[], R>(
  fn: (...args: Args) => R,
  ...args: Args
): Promise<R> {
  const result = await fn(...args);
  if (!result) {
    throw new Error(`no result for call ${fn.name}`);
  }
  return result;
}
