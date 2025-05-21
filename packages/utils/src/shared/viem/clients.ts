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

export type WebSocketViemClient = PublicClient<WebSocketTransport, typeof base>;

export function createWebsocketPublicClient(
  opts: ViemClientOptions
): WebSocketViemClient {
  return viemCreatePublicClient({
    chain: base,
    transport: webSocket(
      `wss://base-mainnet.g.alchemy.com/v2/${opts.alchemyApiKey}`,
      {
        keepAlive: { interval: 10_000 },
        // You must define custom onError handling & retry logic when using this client.
        // Viem retrying the connection will lead to exponential growth of their keepAlive pings.
        reconnect: false,
        retryCount: 0
      }
    )
  });
}

export type HttpViemClient = PublicClient<HttpTransport, typeof base>;

export function createHttpPublicClient(
  opts: ViemClientOptions
): HttpViemClient {
  return viemCreatePublicClient({
    chain: base,
    transport: http(
      `https://base-mainnet.g.alchemy.com/v2/${opts.alchemyApiKey}`
    )
  });
}

export type ViemClient = HttpViemClient | WebSocketViemClient;
