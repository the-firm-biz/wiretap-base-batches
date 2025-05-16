import {
  CLANKER_3_1_TOTAL_SUPPLY,
  CURRENCY_ADDRESSES,
  type ClankerAbi
} from '@wiretap/config';
import { type Address, type Block, type Log } from 'viem';
import type { ExtractAbiEvent } from 'abitype';
import type { MinimalBlock } from './block.js';
import type { DeployTokenArgs } from '../get-transaction-context.js';
import { getPoolContext, type PoolContext } from '../get-pool-context.js';
import { bigIntReplacer, trace, type Context } from '@wiretap/utils/shared';

export type TokenCreatedOnChainParams = {
  transactionHash: `0x${string}`;
  tokenAddress: Address;
  symbol: string;
  tokenName: string;
  deployerContractAddress: Address;
  msgSender: Address;
  block: MinimalBlock;
  totalSupply: number;
  poolContext: PoolContext;
};

export type TokenCreatedLog = Log<
  bigint,
  number,
  false,
  ExtractAbiEvent<ClankerAbi, 'TokenCreated'>,
  true // should be the same as last param in listener WatchContractEventOnLogsParameter
>;

export async function deconstructLog(
  log: TokenCreatedLog,
  args: DeployTokenArgs,
  ctx: Context,
  block?: Block
): Promise<TokenCreatedOnChainParams | undefined> {
  const {
    args: { tokenAddress, name: tokenName, symbol, msgSender },
    address: deployerContractAddress,
    blockNumber
  } = log;

  if (!tokenAddress || !tokenName || !symbol || !msgSender) {
    console.error(
      `deconstructLog :: log.args not returning expected values: ${JSON.stringify(log.args, bigIntReplacer)}`
    );
    return;
  }

  if (args.poolConfig.pairedToken !== CURRENCY_ADDRESSES.WETH) {
    console.error(
      `deconstructLog :: poolConfig.pairedToken is not WETH: ${args.poolConfig.pairedToken}`
    );
    return;
  }

  const timestamp = block?.timestamp
    ? new Date(Number(block.timestamp) * 1000)
    : undefined;

  const poolContext = await trace(
    (contextSpan) =>
      getPoolContext(tokenAddress, args, {
        tracing: { parentSpan: contextSpan }
      }),
    {
      name: 'getPoolContext',
      parentSpan: ctx.tracing?.parentSpan
    }
  );
  return {
    block: {
      number: Number(blockNumber),
      timestamp: timestamp
    },
    transactionHash: log.transactionHash,
    tokenAddress,
    symbol,
    tokenName,
    deployerContractAddress,
    msgSender,
    totalSupply: CLANKER_3_1_TOTAL_SUPPLY,
    poolContext
  } as const;
}
