import type { NeynarCastWithInteractionsAndConversations } from '@wiretap/utils/server';
import { CLANKER_TOKENBOT_FID } from '@wiretap/config';
import type { HandleClankerFarcasterArgs } from '../../handle-clanker-farcaster.js';
import type { TokenCreatedOnChainParams } from '../../types/token-created.js';

export function validateAuthorFid(
  cast: NeynarCastWithInteractionsAndConversations,
  args: HandleClankerFarcasterArgs,
  tokenCreatedData: TokenCreatedOnChainParams
) {
  const { fid } = args;
  const { tokenAddress } = tokenCreatedData;

  if (cast.author.fid !== args.fid) {
    console.log(
      `validateAuthorFid:: author fid ${cast.author.fid} is different ${fid} for ${tokenAddress}`
    );
    return false;
  }
  return true;
}

export function validateDirectReplies(
  cast: NeynarCastWithInteractionsAndConversations,
  args: HandleClankerFarcasterArgs,
  tokenCreatedData: TokenCreatedOnChainParams
) {
  const { tokenAddress } = tokenCreatedData;

  const clankerReply = cast.direct_replies.filter(
    (reply) => reply.author.fid === CLANKER_TOKENBOT_FID
  );
  if (clankerReply.length == 0) {
    console.log(
      `validateDirectReplies:: no reply by clanker for ${tokenAddress}`
    );
    return false;
  }
  const replyWithEmbedTokenUrl = clankerReply.find((clankerReply) => {
    return clankerReply.embeds.find((embed) => {
      return (
        'url' in embed &&
        typeof embed.url === 'string' &&
        embed.url.toLowerCase() ===
          `https://clanker.world/clanker/${tokenAddress}`.toLowerCase()
      );
    });
  });
  if (!replyWithEmbedTokenUrl) {
    console.log(
      `validateDirectReplies:: no reply by clanker with embed ${tokenAddress}`
    );
    return false;
  }
  return true;
}
