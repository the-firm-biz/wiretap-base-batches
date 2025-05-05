import { env } from './env.js';

export const DEFAULT_TOTAL_SUPPLY = 100_000_000_000;
export const DEFAULT_DECIMALS = 18;

export const WETH_BASE_ADDRESS = '0x4200000000000000000000000000000000000006';

export const SUBGRAPHS = {
  MessariUniV3Base: {
    explorerUrl:
      'https://thegraph.com/explorer/subgraphs/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS?view=Query',
    queryUrl: `https://gateway.thegraph.com/api/${env.SUBGRAPH_API_KEY}/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS`
  },
  UniV3Base: {
    explorerUrl:
      'https://thegraph.com/explorer/subgraphs/HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1?view=Query',
    queryUrl: `https://gateway.thegraph.com/api/${env.SUBGRAPH_API_KEY}/subgraphs/id/HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1`
  }
};
