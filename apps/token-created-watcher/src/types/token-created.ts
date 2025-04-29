import { type ClankerAbi } from '@wiretap/config';
import type { Address, Log } from 'viem';
import type { ExtractAbiEvent } from 'abitype';

export type TokenCreatedOnChainParams = {
  transactionHash: `0x${string}`;
  tokenAddress: Address;
  symbol: string;
  tokenName: string;
  deployerContractAddress: Address;
  msgSender: Address;
};

export type TokenCreatedLog = Log<
  bigint,
  number,
  false,
  ExtractAbiEvent<ClankerAbi, 'TokenCreated'>,
  true // should be the same as last param in listener WatchContractEventOnLogsParameter
>;

export function deconstructLog(
  log: TokenCreatedLog
): TokenCreatedOnChainParams {
  const {
    args: { tokenAddress, name: tokenName, symbol, msgSender },
    address: deployerContractAddress
  } = log;

  if (!tokenAddress || !tokenName || !symbol || !msgSender) {
    // @todo error - handle gracefully
    throw new Error(
      `log.args not returning expected values: ${JSON.stringify(log.args)}`
    );
  }

  return {
    transactionHash: log.transactionHash,
    tokenAddress,
    symbol,
    tokenName,
    deployerContractAddress,
    msgSender
  } as const;
}
