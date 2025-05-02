import {
  createHttpPublicClient,
  createWebsocketPublicClient
} from '@wiretap/utils/shared';
import { env } from './env.js';

export const websocketPublicClient = createWebsocketPublicClient({
  alchemyApiKey: env.ALCHEMY_API_KEY
});

export const httpPublicClient = createHttpPublicClient({
  alchemyApiKey: env.ALCHEMY_API_KEY
});
