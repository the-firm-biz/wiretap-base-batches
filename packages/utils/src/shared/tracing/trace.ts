import { Span, type TraceParams } from './types.js';

export async function trace<T>(
  fn: (span: Span) => T,
  params: TraceParams
): Promise<T> {
  const span = new Span(params.name);
  try {
    const result = await fn(span);
    span.finish('ok');
    return result;
  } catch (error) {
    span.finish('failed');
    throw error;
  } finally {
    if (params.parentSpan) {
      params.parentSpan.attachChild(span);
    }
  }
}
