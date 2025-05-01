import { Address, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants';
import {
  createKernelAccountClient,
  createZeroDevPaymasterClient
} from '@zerodev/sdk';
import { serverEnv } from '@/serverEnv';
import { deserializePermissionAccount } from '@zerodev/permissions';
import { toECDSASigner } from '@zerodev/permissions/signers';
import { privateKeyToAccount } from 'viem/accounts';
import { clientEnv } from '@/clientEnv';

const kernelVersion = KERNEL_V3_1;
const entryPoint = getEntryPoint('0.7');

// @todo session keys - support mainnet
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    `https://base-sepolia.g.alchemy.com/v2/${clientEnv.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  )
});

/**
 * Backend Kernel Client
 */
export const createKernelClient = async (serializedSessionKey: string) => {
  const validatorSigner = await toECDSASigner({
    signer: privateKeyToAccount(
      serverEnv.KERNEL_VALIDATOR_PRIVATE_KEY as Address
    )
  });

  const account = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    kernelVersion,
    serializedSessionKey,
    validatorSigner
  );

  const paymasterClient = createZeroDevPaymasterClient({
    chain: baseSepolia,
    transport: http(serverEnv.ZERODEV_RPC)
  });

  const kernelClient = createKernelAccountClient({
    account,
    chain: baseSepolia,
    bundlerTransport: http(serverEnv.ZERODEV_RPC),
    client: publicClient,
    paymaster: {
      getPaymasterData(userOperation) {
        return paymasterClient.sponsorUserOperation({ userOperation });
      }
    }
  });

  return kernelClient;
};
