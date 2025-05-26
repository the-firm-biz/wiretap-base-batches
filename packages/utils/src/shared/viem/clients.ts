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
  transportUrl: string;
}

export type WebSocketViemClient = PublicClient<WebSocketTransport, typeof base>;

export function createWebsocketPublicClient(
  opts: ViemClientOptions
): WebSocketViemClient {
  return viemCreatePublicClient({
    chain: base,
    transport: webSocket(opts.transportUrl, {
      keepAlive: { interval: 10_000 },
      // You must define custom onError handling & retry logic when using this client.
      // Viem retrying the connection will lead to exponential growth of their keepAlive pings.
      reconnect: false,
      retryCount: 0
    })
  });
}

export type HttpViemClient = PublicClient<HttpTransport, typeof base>;

let httpClientInstance: HttpViemClient | undefined;

export function createHttpPublicClient(
  opts: ViemClientOptions
): HttpViemClient {
  if (!httpClientInstance) {
    httpClientInstance = viemCreatePublicClient({
      chain: base,
      transport: http(opts.transportUrl)
    });
  }

  return httpClientInstance;
}

export type ViemClient = HttpViemClient | WebSocketViemClient;

// @todo Migrate to this pattern using transportUrl rather than a termplate string with alchemy hardcoded
export interface QuicknodeHttpClientOptions {
  transportUrl: string;
}
let clientInstance: HttpViemClient | undefined;

export function createQuicknodeHttpClient(
  opts: QuicknodeHttpClientOptions
): HttpViemClient {
  if (!clientInstance) {
    clientInstance = viemCreatePublicClient({
      chain: base,
      transport: http(opts.transportUrl)
    });
  }

  return clientInstance;
}
