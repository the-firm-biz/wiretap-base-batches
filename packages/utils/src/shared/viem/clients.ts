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
      `wss://indulgent-wild-gas.base-mainnet.quiknode.pro/e4eb6a46ca8caa82575bf650c455d5fe5825f40d/`,
      {
        keepAlive: { interval: 1_000 }
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
      `https://indulgent-wild-gas.base-mainnet.quiknode.pro/e4eb6a46ca8caa82575bf650c455d5fe5825f40d/`
    )
  });
}

export type ViemClient = HttpViemClient | WebSocketViemClient;
