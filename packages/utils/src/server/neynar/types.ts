import type {
  CastWithInteractionsAndConversations,
  User
} from '@neynar/nodejs-sdk/build/api/index.js';
import { NeynarAPIClient as SdkNeynarAPIClient } from '@neynar/nodejs-sdk/build/clients/NeynarAPIClient.js';

export type NeynarUser = User;
export type NeynarCastWithInteractionsAndConversations =
  CastWithInteractionsAndConversations;
export type NeynarAPIClient = SdkNeynarAPIClient;
