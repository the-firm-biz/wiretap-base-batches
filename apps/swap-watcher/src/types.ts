import type { UniswapPoolV3Abi } from '@wiretap/config';
import type { Log } from 'viem';
import type { ExtractAbiEvent } from 'abitype';

export type SwapLog = Log<
  bigint,
  number,
  false,
  ExtractAbiEvent<UniswapPoolV3Abi, 'Swap'>,
  true
>;
