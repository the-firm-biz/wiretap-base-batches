import { type ClankerAbi } from '@wiretap/config';
import { type Address, type Log } from 'viem';
import type { ExtractAbiEvent } from 'abitype';
import { httpPublicClient } from '../rpc-clients.js';
import type { Block } from './block.js';
import { callWithBackOff } from '@wiretap/utils/server';
import { bigIntReplacer } from '@wiretap/utils/shared';

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
  log: TokenCreatedLog
): Promise<TokenCreatedOnChainParams> {
  const {
    args: { tokenAddress, name: tokenName, symbol, msgSender },
    address: deployerContractAddress,
    blockNumber
  } = log;

  if (!tokenAddress || !tokenName || !symbol || !msgSender) {
    // @todo error - handle gracefully
    throw new Error(
      `log.args not returning expected values: ${JSON.stringify(log.args, bigIntReplacer)}`
    );
  }

  const block = await callWithBackOff(
    () => httpPublicClient.getBlock({ blockNumber }),
    'getBlock'
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
