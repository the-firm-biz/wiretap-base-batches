import {
  countTokensByCreator,
  getFarcasterAccount,
  singletonDb
} from '@wiretap/db';
import { env } from '../env.js';
import { calculateTokenScore } from './calculate-token-score.js';
import type { NeynarUser } from '@wiretap/utils/server';

export interface TokenScoreDetails {
  previousDeploymentsCount: number;
  tokenScore: number;
}

export async function getTokenScore(
  neynarUser: NeynarUser
): Promise<TokenScoreDetails | null> {
  if (!neynarUser.experimental?.neynar_user_score) {
    console.log('[get-token-score] Neynar score missing', neynarUser);
    return null;
  }

  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const farcasterAccount = await getFarcasterAccount(db, neynarUser.fid);
  const previousDeploymentsCount = farcasterAccount
    ? await countTokensByCreator(db, farcasterAccount.accountEntityId)
    : 0;

  const tokenScore = calculateTokenScore({
    previousDeploymentsCount,
    userFollowersCount: neynarUser.follower_count,
    neynarScore: neynarUser.experimental.neynar_user_score
  });

  return {
    previousDeploymentsCount,
    tokenScore
  };
}
