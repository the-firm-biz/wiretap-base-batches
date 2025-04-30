export function throwOnUnknownResult<T>(result: T, context = 'call'): T {
  if (!result) {
    throw new Error(`no result for ${context}`);
  }
  return result;
}
