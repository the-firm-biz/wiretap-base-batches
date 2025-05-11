import type {
  CastWithInteractionsAndConversations,
  SearchedUser,
  User
} from '@neynar/nodejs-sdk/build/api/index.js';
import { NeynarAPIClient as SdkNeynarAPIClient } from '@neynar/nodejs-sdk/build/clients/NeynarAPIClient.js';

export type NeynarUser = User;
export type NeynarSearchedUser = SearchedUser;
export type NeynarCastWithInteractionsAndConversations =
  CastWithInteractionsAndConversations;
export type NeynarAPIClient = SdkNeynarAPIClient;
