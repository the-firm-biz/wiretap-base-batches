const DEFAULT_OPTS = {
  followersWeight: 0.4,
  neynarScoreWeight: 0.6,
  deploymentsPenaltyExponent: 0.5,
  minFollowers: 0,
  maxFollowers: 1e9
} as const;

interface CalculateTokenScoreArgs {
  previousDeploymentsCount: number;
  userFollowersCount: number;
  neynarScore: number;
}

/**
 * Compute a "token score" based on:
 *  - follower count at deploy time
 *  - neynar score at deploy time
 *  - how many tokens they’ve already deployed
 */
export function calculateTokenScore(args: CalculateTokenScoreArgs): number {
  const { previousDeploymentsCount, userFollowersCount, neynarScore } = args;

  // Cap the follower count to an arbitrary high value to normalize the score
  const cappedFollowersCount = Math.min(
    Math.max(userFollowersCount, DEFAULT_OPTS.minFollowers),
    DEFAULT_OPTS.maxFollowers
  );

  // Normalize the follower count "score" into [0–1]
  const normFollowersCount =
    Math.log10(cappedFollowersCount + 1) /
    Math.log10(DEFAULT_OPTS.maxFollowers + 1);

  // Weighted sum of “good” signals
  const baseScore =
    DEFAULT_OPTS.followersWeight * normFollowersCount +
    DEFAULT_OPTS.neynarScoreWeight * neynarScore;

  // Penalty for deploying multiple tokens
  const penalty = Math.pow(
    1 + previousDeploymentsCount,
    DEFAULT_OPTS.deploymentsPenaltyExponent
  );

  return baseScore / penalty;
}
