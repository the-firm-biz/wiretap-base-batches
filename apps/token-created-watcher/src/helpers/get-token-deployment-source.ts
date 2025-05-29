import { type ParsedTokenContext } from '../types/index.js';

interface TokenContextParams {
  tokenContextInterface: ParsedTokenContext['interface'];
  platform: ParsedTokenContext['platform'];
}

/**
 * - Bankr - `@bankrbot` X or via https://bankr.bot ui.
 * - clanker.world - https://www.clanker.world UI without connected farcaster account
 * - clanker.world farcaster - https://www.clanker.world UI with connected farcaster account
 * - clanker farcaster - via `@clanker` on farcaster
 * - unknown - Any other deployment context
 */
type TokenDeploymentSource =
  | 'bankr'
  | 'clanker.world'
  | 'clanker.world_farcaster'
  | 'clanker_farcaster'
  | 'unknown';

export function getTokenDeploymentSource({
  tokenContextInterface,
  platform
}: TokenContextParams): TokenDeploymentSource {
  const isBankr = tokenContextInterface === 'Bankr';

  if (isBankr) {
    return 'bankr';
  }

  const isClankerWorld = tokenContextInterface === 'clanker.world';
  const isFarcasterClankerWorld = platform === 'farcaster';

  /**
   * deployed via clanker.world with no connected farcaster account
   */
  if (isClankerWorld && !isFarcasterClankerWorld) {
    return 'clanker.world';
  }

  /**
   * deployed via clanker.world with connected farcaster account
   */
  if (isClankerWorld && isFarcasterClankerWorld) {
    return 'clanker.world_farcaster';
  }

  /**
   * deployed via @clanker on Farcaster
   */
  const isFarcasterClanker = tokenContextInterface === 'clanker';
  if (isFarcasterClanker) {
    return 'clanker_farcaster';
  }

  return 'unknown';
}
