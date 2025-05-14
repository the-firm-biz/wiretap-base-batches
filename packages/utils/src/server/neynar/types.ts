import { z } from 'zod';
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

/** A non-exhaustive schema for a Neynar User */
export const neynarUserSchema = z.object({
  fid: z.number(),
  object: z.literal('user'),
  custody_address: z.string(),
  username: z.string(),
  follower_count: z.number(),
  display_name: z.string().nullish(),
  pfp_url: z.string().nullish(),
  verified_accounts: z.array(
    z.object({
      platform: z.string().nullish(),
      username: z.string().nullish()
    })
  ),
  verified_addresses: z.object({
    eth_addresses: z.array(z.string()),
    sol_addresses: z.array(z.string()),
    primary: z.object({
      eth_address: z.string().nullish(),
      sol_address: z.string().nullish()
    })
  })
});
