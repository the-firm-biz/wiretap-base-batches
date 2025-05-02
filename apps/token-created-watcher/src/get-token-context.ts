import { decodeFunctionData } from 'viem/utils';
import { CLANKER_ABI } from '@wiretap/config';
import { type ParsedTokenContext } from './types/index.js';
import { httpPublicClient } from './rpc-clients.js';

export const getTokenContext = async (
  transactionHash: `0x${string}`
): Promise<ParsedTokenContext> => {
  const transaction = await httpPublicClient.getTransaction({
    hash: transactionHash
  });

  const { args: transactionArgs } = decodeFunctionData({
    abi: CLANKER_ABI,
    data: transaction.input
  });

  /** Validate decoded transaction args */
  const isTokenConfigInArgs =
    typeof transactionArgs[0] === 'object' &&
    'tokenConfig' in transactionArgs[0];

  if (!transactionArgs || !isTokenConfigInArgs) {
    // @todo error - handle gracefully
    throw new Error(
      `decoded transaction args not expected shape: ${JSON.stringify(transactionArgs)}`
    );
  }

  const tokenConfig = transactionArgs[0].tokenConfig;
  // TODO: zod? (note that zod might be slow)
  const tokenContext = JSON.parse(tokenConfig.context) as ParsedTokenContext;

  return tokenContext;
};
