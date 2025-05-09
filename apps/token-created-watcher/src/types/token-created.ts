import { type ClankerAbi } from '@wiretap/config';
import { type Address, type Log } from 'viem';
import type { ExtractAbiEvent } from 'abitype';
import { httpPublicClient } from '../rpc-clients.js';
import type { Block } from './block.js';
import { callWithBackOff } from '@wiretap/utils/server';
import { bigIntReplacer, type Context } from '@wiretap/utils/shared';

export type TokenCreatedOnChainParams = {
  transactionHash: `0x${string}`;
  tokenAddress: Address;
  symbol: string;
  tokenName: string;
  deployerContractAddress: Address;
  msgSender: Address;
  block: Block;
};

export type TokenCreatedLog = Log<
  bigint,
  number,
  false,
  ExtractAbiEvent<ClankerAbi, 'TokenCreated'>,
  true // should be the same as last param in listener WatchContractEventOnLogsParameter
>;

export async function deconstructLog(
  { tracing }: Context,
  log: TokenCreatedLog
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

  const block = await callWithBackOff(
    () => httpPublicClient.getBlock({ blockNumber }),
    {
      name: 'getBlock',
      tracing
    }
  );

  const timestamp = block
    ? new Date(Number(block.timestamp) * 1000)
    : undefined;

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
    msgSender
  } as const;
}
