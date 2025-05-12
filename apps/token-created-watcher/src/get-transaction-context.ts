import { decodeFunctionData } from 'viem/utils';
import { CLANKER_ABI, type ClankerAbi } from '@wiretap/config';
import { httpPublicClient } from './rpc-clients.js';
import type { ContractFunctionArgs } from 'viem';
import { callWithBackOff } from '@wiretap/utils/server';

export type DeployTokenArgs = ContractFunctionArgs<
  ClankerAbi,
  'payable',
  'deployToken'
>[0];

export type TransactionContext = Awaited<
  ReturnType<typeof getTransactionContext>
>;

export const getTransactionContext = async (
  blockNumber: bigint,
  transactionHash: `0x${string}`
) => {
  const [block, transaction] = await Promise.all([
    callWithBackOff(
      () => httpPublicClient.getBlock({ blockNumber }),
      'getBlock'
    ),
    callWithBackOff(
      () => httpPublicClient.getTransaction({ hash: transactionHash }),
      'getTransactionReceipt'
    )
  ]);

  if (!transaction) {
    throw new Error(`Transaction not found for hash: ${transactionHash}`);
  }

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

  return { block, transaction, args: transactionArgs[0] };
};
