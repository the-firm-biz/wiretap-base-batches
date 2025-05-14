import { Span } from '../tracing/index.js';

export type Tracing = {
  parentSpan?: Span;
};

export type Context = {
  name?: string;
  tracing?: Tracing;
};
