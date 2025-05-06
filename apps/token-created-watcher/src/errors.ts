export class TokenIndexerError extends Error {
  public details: Record<string, unknown>;
  public source: string;

  constructor(
    message: string,
    source: string,
    details: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TokenIndexerError';
    this.details = details;
    this.source = source;
  }

  /** Formats error for human-readable output (e.g. Slack) */
  public toLogString() {
    return JSON.stringify(
      {
        message: this.message,
        source: this.source,
        details: this.details
      },
      null,
      2
    );
  }
}
