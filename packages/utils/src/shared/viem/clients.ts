import {
  createPublicClient as viemCreatePublicClient,
  http,
  webSocket,
  type PublicClient,
  type WebSocketTransport,
  type HttpTransport
} from 'viem';
import { base } from 'viem/chains';

export interface ViemClientOptions {
  alchemyApiKey: string;
}

export function createWebsocketPublicClient(
  opts: ViemClientOptions
): PublicClient<WebSocketTransport, typeof base> {
  return viemCreatePublicClient({
    chain: base,
    transport: webSocket(
      `wss://base-mainnet.g.alchemy.com/v2/${opts.alchemyApiKey}`,
      {
        keepAlive: { interval: 1_000 }
      }
    )
  });
}

export function createHttpPublicClient(
  opts: ViemClientOptions
): PublicClient<HttpTransport, typeof base> {
  return viemCreatePublicClient({
    chain: base,
    transport: http(
      `https://base-mainnet.g.alchemy.com/v2/${opts.alchemyApiKey}`
    )
  });
}
