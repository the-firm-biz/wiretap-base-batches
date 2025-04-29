import { Configuration, NeynarAPIClient } from '@neynar/nodejs-sdk';

export interface NeynarClientOptions {
  apiKey: string;
  forceNew?: boolean;
}

export function getNeynarClient(opts: NeynarClientOptions): NeynarAPIClient {
  const config = new Configuration({
    apiKey: opts.apiKey
  });
  return new NeynarAPIClient(config);
}

let _singleTonClient: NeynarAPIClient | null = null;
export function getSingletonNeynarClient(
  opts: NeynarClientOptions
): NeynarAPIClient {
  if (!_singleTonClient) {
    _singleTonClient = getNeynarClient(opts);
  }
  return _singleTonClient;
}
