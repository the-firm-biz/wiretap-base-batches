import { FARCASTER_USER_FOLLOWER_COUNT_THRESHOLD } from '@wiretap/config';
import {
  fetchBulkUsers,
  handleNotifySlack,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { type Address } from 'viem';
import { env } from './env.js';

interface HandleClankerFarcasterArgs {
  tokenAddress: Address;
  symbol: string;
  fid: string;
  transactionHash: string;
  messageId: string;
}

/**
 * ALL EXISTING CODE HERE IS OLD. PLEASE SEE ISSUE FOR WHAT NEEDS TO BE DONE
 * @todo - https://linear.app/the-firm/issue/ENG-278/[indexer]-special-handling-for-clanker-farcaster-deployments
 */
export async function handleClankerFarcaster({
  tokenAddress,
  symbol,
  fid,
  transactionHash,
  messageId
}: HandleClankerFarcasterArgs) {
  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });
  const users = await fetchBulkUsers(neynarClient, [fid]);
  if (!users || users.length === 0 || !users[0]) {
    console.warn(
      `handleFarcaster:: User could not be found for ${symbol} | ${tokenAddress} - FID ${fid}`
    );
    return;
  }

  const user = users[0];

  if (user.follower_count < FARCASTER_USER_FOLLOWER_COUNT_THRESHOLD) {
    console.log(
      `FARCASTER - fewer than ${FARCASTER_USER_FOLLOWER_COUNT_THRESHOLD} followers - noop`,
      {
        username: user.username,
        followerCount: user.follower_count,
        tokenAddress,
        symbol,
        messageId
      }
    );
    return;
  }

  if (!env.IS_SLACK_NOTIFICATION_ENABLED) {
    console.log(
      `FARCASTER - ${FARCASTER_USER_FOLLOWER_COUNT_THRESHOLD} follower threshold met, but notifications disabled`,
      {
        username: user.username,
        followerCount: user.follower_count,
        tokenAddress,
        symbol,
        messageId
      }
    );
    return;
  }

  const slackMessage = `
Oh boy we got a big one here. :politecat: *${user.username}* has *${user.follower_count}* followers.

And they just <https://basescan.org/tx/${transactionHash}|clanked> *${symbol}* - *${tokenAddress}*

:credit_card: <https://kyberswap.com/swap/base/eth-to-${tokenAddress}|Kyber Swap>
:dash: <https://warpcast.com/${user.username}/${messageId}|Warpcast>
:globe_with_meridians: <https://www.clanker.world/clanker/${tokenAddress}|Clanker World>
:chart_with_upwards_trend: <https://dexscreener.com/base/${tokenAddress}|DexScreener>
`;
  await handleNotifySlack(slackMessage, {
    slackToken: env.SLACK_TOKEN
  });
}
