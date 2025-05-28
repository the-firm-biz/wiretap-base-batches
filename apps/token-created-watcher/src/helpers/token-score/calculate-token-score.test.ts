import { calculateTokenScore } from './calculate-token-score.js';

describe('calculateTokenScore', () => {
  const testCases = [
    // [previousDeploymentsCount, userFollowersCount, neynarScore, expectedDescription]
    [0, 1000, 0.8, 'high followers, high neynar score, first deployment'],
    [0, 100, 0.5, 'medium followers, medium neynar score, first deployment'],
    [0, 10, 0.2, 'low followers, low neynar score, first deployment'],
    [5, 1000, 0.8, 'high followers, high neynar score, multiple deployments'],
    [10, 100, 0.5, 'medium followers, medium neynar score, many deployments'],
    [0, 0, 0, 'no followers, no neynar score, first deployment'],
    [
      0,
      1000000,
      1.0,
      'very high followers, max neynar score, first deployment'
    ],
    [1, 500, 0.7, 'good followers, good neynar score, second deployment'],
    [3, 50, 0.3, 'low followers, low neynar score, few deployments'],
    [0, 10000, 0.9, 'high followers, very high neynar score, first deployment']
  ] as const;

  test.each(testCases)(
    'calculates score for %i deployments, %i followers, %f neynar score (%s)',
    (previousDeploymentsCount, userFollowersCount, neynarScore) => {
      const score = calculateTokenScore({
        previousDeploymentsCount,
        userFollowersCount,
        neynarScore
      });

      // Score should be a positive number
      expect(score).toBeGreaterThan(0);
      expect(Number.isFinite(score)).toBe(true);
      expect(typeof score).toBe('number');
    }
  );

  it('penalizes multiple deployments', () => {
    const baseArgs = { userFollowersCount: 1000, neynarScore: 0.8 };

    const firstDeployment = calculateTokenScore({
      ...baseArgs,
      previousDeploymentsCount: 0
    });
    const secondDeployment = calculateTokenScore({
      ...baseArgs,
      previousDeploymentsCount: 1
    });
    const fifthDeployment = calculateTokenScore({
      ...baseArgs,
      previousDeploymentsCount: 4
    });

    expect(firstDeployment).toBeGreaterThan(secondDeployment);
    expect(secondDeployment).toBeGreaterThan(fifthDeployment);
  });

  it('rewards higher follower counts', () => {
    const baseArgs = { previousDeploymentsCount: 0, neynarScore: 0.5 };

    const lowFollowers = calculateTokenScore({
      ...baseArgs,
      userFollowersCount: 10
    });
    const mediumFollowers = calculateTokenScore({
      ...baseArgs,
      userFollowersCount: 1000
    });
    const highFollowers = calculateTokenScore({
      ...baseArgs,
      userFollowersCount: 100000
    });

    expect(highFollowers).toBeGreaterThan(mediumFollowers);
    expect(mediumFollowers).toBeGreaterThan(lowFollowers);
  });

  it('rewards higher neynar scores', () => {
    const baseArgs = { previousDeploymentsCount: 0, userFollowersCount: 1000 };

    const lowScore = calculateTokenScore({ ...baseArgs, neynarScore: 0.1 });
    const mediumScore = calculateTokenScore({ ...baseArgs, neynarScore: 0.5 });
    const highScore = calculateTokenScore({ ...baseArgs, neynarScore: 0.9 });

    expect(highScore).toBeGreaterThan(mediumScore);
    expect(mediumScore).toBeGreaterThan(lowScore);
  });

  it('deployment count should have bigger impact than high neynar score and follower count', () => {
    // High quality user with many deployments vs low quality user with no deployments
    const highQualityManyDeployments = calculateTokenScore({
      previousDeploymentsCount: 4,
      userFollowersCount: 100000,
      neynarScore: 1.0
    });

    const lowQualityFirstDeployment = calculateTokenScore({
      previousDeploymentsCount: 0,
      userFollowersCount: 100,
      neynarScore: 0.1
    });

    // Even with max followers and neynar score, many deployments should result in lower score
    // than a low quality user's first deployment
    expect(lowQualityFirstDeployment).toBeGreaterThan(
      highQualityManyDeployments
    );

    // Additional test: moderate quality user with 1 deployment vs high quality third deployment
    const highQualityThirdDeployment = calculateTokenScore({
      previousDeploymentsCount: 2,
      userFollowersCount: 50000,
      neynarScore: 0.9
    });

    const moderateQualitySecondDeployment = calculateTokenScore({
      previousDeploymentsCount: 1,
      userFollowersCount: 10000,
      neynarScore: 0.7
    });

    expect(moderateQualitySecondDeployment).toBeGreaterThan(
      highQualityThirdDeployment
    );
  });

  it('handles edge cases', () => {
    // Zero followers should still produce a valid score
    const zeroFollowers = calculateTokenScore({
      previousDeploymentsCount: 0,
      userFollowersCount: 0,
      neynarScore: 0.5
    });
    expect(zeroFollowers).toBeGreaterThan(0);

    // Zero neynar score should still produce a valid score
    const zeroNeynar = calculateTokenScore({
      previousDeploymentsCount: 0,
      userFollowersCount: 1000,
      neynarScore: 0
    });
    expect(zeroNeynar).toBeGreaterThan(0);

    // Zero followers and zero neynar score should still produce a valid score
    const zeroFollowersAndZeroNeynar = calculateTokenScore({
      previousDeploymentsCount: 0,
      userFollowersCount: 0,
      neynarScore: 0
    });
    expect(zeroFollowersAndZeroNeynar).toBeGreaterThan(0);

    // Very high follower count should be capped
    const veryHighFollowers = calculateTokenScore({
      previousDeploymentsCount: 0,
      userFollowersCount: 1e12, // Higher than max
      neynarScore: 0.5
    });
    expect(Number.isFinite(veryHighFollowers)).toBe(true);
  });
});
