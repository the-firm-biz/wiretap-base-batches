export interface ParsedTokenContext {
  /**
   * The interface that created this token
   * - "Bankr" - deployed via Bankr Terminal or X https://bankr.bot/terminal | https://x.com/bankrbot
   * - "clanker.world" - deployed via https://clanker.world/
   * - "clanker" - deployed via Farcaster. https://warpcast.com/clanker
   */
  interface: 'Bankr' | 'clanker.world' | 'clanker';

  /**
   * The (farcaster?) platform used to deploy the token
   * - For 'Bankr': undefined
   * - For 'clanker.world': 'farcaster' when connected via Farcaster, or empty string
   * - For 'clanker': always 'farcaster'
   */
  platform?: string;

  /**
   * An identifier for the source message/transaction
   * - For 'Bankr': 'bankr deployment'
   * - For 'clanker.world': empty string
   * - For 'clanker': Farcaster message ID - used to construct Warpcast links
   */
  messageId: string;

  /**
   * The Farcaster ID (FID) of the deployer or service, if available
   * - For 'Bankr': FID of the Bankr service
   * - For 'clanker.world': FID of the deployer if connected via Farcaster, or empty string
   * - For 'clanker': FID of the deployer Farcaster account
   */
  id: string;
}
