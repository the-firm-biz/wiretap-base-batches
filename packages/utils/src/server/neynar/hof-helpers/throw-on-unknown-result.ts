/* eslint-disable @typescript-eslint/no-explicit-any */
export function throwOnUnknownResult<Fn extends (...args: any[]) => any>(
  fn: Fn
) {
  return async (...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> => {
    const result = await fn(...args);
    if (!result) {
      throw new Error(`no result for call ${fn.name}`);
    }
    return result;
  };
}
