const DEFAULT_OPTS = {
  followersWeight: 0.4,
  neynarScoreWeight: 0.6,
  deploymentsPenaltyExponent: 1.2,
  minFollowers: 0,
  maxFollowers: 1e9,
  minBaseScore: 0.01
} as const;

interface CalculateTokenScoreArgs {
  previousDeploymentsCount: number;
  userFollowersCount?: number;
  neynarScore?: number;
}

/**
 * Compute a "token score" based on:
 *  - follower count at deploy time
 *  - neynar score at deploy time
 *  - how many tokens they've already deployed
 *  - capped at minimum score of 0.01
 */
export function calculateTokenScore(args: CalculateTokenScoreArgs): number {
  const {
    previousDeploymentsCount,
    userFollowersCount = 0,
    neynarScore = 0
  } = args;

  // Cap the follower count to an arbitrary high value to normalize the score
  const cappedFollowersCount = Math.min(
    Math.max(userFollowersCount, DEFAULT_OPTS.minFollowers),
    DEFAULT_OPTS.maxFollowers
  );

  // Normalize the follower count "score" into [0–1]
  const normFollowersCount =
    Math.log10(cappedFollowersCount + 1) /
    Math.log10(DEFAULT_OPTS.maxFollowers + 1);

  // Weighted sum of "good" signals, capped at minBaseScore
  const baseScore = Math.max(
    DEFAULT_OPTS.followersWeight * normFollowersCount +
      DEFAULT_OPTS.neynarScoreWeight * neynarScore,
    DEFAULT_OPTS.minBaseScore
  );

  // Penalty for deploying multiple tokens
  const penalty = Math.pow(
    1 + previousDeploymentsCount,
    DEFAULT_OPTS.deploymentsPenaltyExponent
  );

  return baseScore / penalty;
}
