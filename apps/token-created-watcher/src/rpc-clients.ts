import {
  createHttpPublicClient,
  createWebsocketPublicClient
} from '@wiretap/utils/shared';
import { env } from './env.js';
import type { HttpTransport, PublicClient, WebSocketTransport } from 'viem';
import { base } from 'viem/chains';

export const websocketPublicClient: PublicClient<
  WebSocketTransport,
  typeof base
> = createWebsocketPublicClient({
  alchemyApiKey: env.ALCHEMY_API_KEY
});

export const httpPublicClient: PublicClient<HttpTransport, typeof base> =
  createHttpPublicClient({
    alchemyApiKey: env.ALCHEMY_API_KEY
  });
