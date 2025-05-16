/** Clanker 3.1 contract address */
export const CLANKER_3_1_ADDRESS = '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

interface AddressMap {
  [label: string]: string;
}

/** Known addresses that deploy Clanker 3.1 tokens on behalf of users */
export const DELEGATED_CLANKER_DEPLOYER_ADDRESSES: AddressMap = {
  BANKR: '0x2112b8456AC07c15fA31ddf3Bf713E77716fF3F9',
  CLANK_FUN: '0xdd6494902709C8D7DfFf3daca21cF067271f22F8',
  CLANK_FUN_2: '0xdc7D0Ea3B64E0c74488faF6B2BDc927B875Cd3f2',
  /** If you @ clanker on Farcaster, it will deploy the token using this address */
  CLANKER_FARCASTER_DEPLOYMENT_ADDRESS:
    '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58'
} as const;

/** Uniswap V3 addresses */
export const UNISWAP_V3_ADDRESSES = {
  FACTORY: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
} as const satisfies AddressMap;

/** Currency addresses */
export const CURRENCY_ADDRESSES = {
  WETH: '0x4200000000000000000000000000000000000006'
} as const satisfies AddressMap;
