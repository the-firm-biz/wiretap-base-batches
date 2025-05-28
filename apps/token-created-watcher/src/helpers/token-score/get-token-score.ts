import { countTokensByCreator, singletonDb } from '@wiretap/db';
import { env } from '../../env.js';
import { calculateTokenScore } from './calculate-token-score.js';

interface GetTokenScoreParams {
  accountEntityId: number;
  neynarUserScore?: number;
  neynarUserFollowersCount?: number;
}

export interface TokenScoreDetails {
  previousDeploymentsCount: number;
  tokenScore: number;
}

export async function getTokenScore({
  accountEntityId,
  neynarUserScore,
  neynarUserFollowersCount
}: GetTokenScoreParams): Promise<TokenScoreDetails> {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const previousDeploymentsCount = await countTokensByCreator(
    db,
    accountEntityId
  );

  const tokenScore = calculateTokenScore({
    previousDeploymentsCount,
    userFollowersCount: neynarUserFollowersCount,
    neynarScore: neynarUserScore
  });

  return {
    previousDeploymentsCount,
    tokenScore
  };
}
