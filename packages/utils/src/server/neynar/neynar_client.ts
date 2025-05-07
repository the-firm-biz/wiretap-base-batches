import {
  Configuration,
  NeynarAPIClient as SdkNeynarAPIClient
} from '@neynar/nodejs-sdk';
import type { NeynarAPIClient } from './types.js';

export interface NeynarClientOptions {
  apiKey: string;
  forceNew?: boolean;
}

export function getNeynarClient(opts: NeynarClientOptions): NeynarAPIClient {
  const config = new Configuration({
    apiKey: opts.apiKey,
    baseOptions: {
      headers: {
        'x-neynar-experimental': true
      }
    }
  });
  return new SdkNeynarAPIClient(config);
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
