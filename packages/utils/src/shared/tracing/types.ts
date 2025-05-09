export type FinisSpanStatus = 'ok' | 'failed';
type SpanStatus = 'pending' | FinisSpanStatus;

export interface TraceParams {
  name: string;
  parentSpan?: Span;
}

export class Span {
  readonly start: Date = new Date();

  private parent: Span | undefined = undefined;

  private status: SpanStatus = 'pending';
  private end: Date | undefined;

  private children: Span[] = [];

  constructor(readonly name: string) {}

  public finish(status: FinisSpanStatus) {
    this.end = new Date();
    this.status = status;
  }

  public attachChild(span: Span) {
    span.parent = this;
    this.children.push(span);
  }

  public root(): Span {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Span = this;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }
}
