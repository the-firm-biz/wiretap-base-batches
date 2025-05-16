import { parseEther } from 'viem';

export const CLANKER_3_1_FIRST_DEPLOYED_TOKEN_BLOCK = 27733501;

/** Farcaster user follower count threshold */
export const FARCASTER_USER_FOLLOWER_COUNT_THRESHOLD = 7500;

/** Total supply of CLANKER_3_1 */
export const CLANKER_3_1_TOTAL_SUPPLY = 100_000_000_000;

/** Clanker 3.1 Uniswap V3 fee in basis points */
export const CLANKER_3_1_UNISWAP_FEE_BPS = 10000;

/** Uniswap V3 Pool Created Topic */
export const UNISWAP_V3_POOL_CREATED_TOPIC =
  '0x0dfe168177b9affe7b58c4ab64a313695e95d82978a972e459e6921b3ee5e9c9';

/** Q96 for Uniswap V3 */
export const Q96 = 2n ** 96n;

/** Q192 for Uniswap V3 */
export const Q192 = Q96 * Q96;

/** ETH/USD Pyth price id */
export const ETH_USD_PRICE_ID =
  'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

/** PubSub channel for indexing pools */
export const INDEXING_POOLS_PUBSUB_CHANNEL = 'indexer:token-pool-added';

/**
 * The minimum trade size where we will attempt to execute a rebalance
 * @TODO: make USD based
 */
export const MIN_TRADE_THRESHOLD_WEI: bigint = parseEther('0.0002', 'wei');
