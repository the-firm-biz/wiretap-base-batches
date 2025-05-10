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
 * Creates a Kernel client for backend operations using a serialized session key
 *
 * @param serializedSessionKey - Session key approval created on frontend and signed by user
 * @returns KernelAccountClient can execute transactions on behalf of the user
 */
export const createKernelClient = async (serializedSessionKey: string) => {
  const kernelValidatorPrivateKey = serverEnv.KERNEL_VALIDATOR_PRIVATE_KEY;
  const zeroDevRpc = serverEnv.ZERODEV_RPC;

  if (!kernelValidatorPrivateKey) {
    throw new Error('KERNEL_VALIDATOR_PRIVATE_KEY is not set');
  }

  if (!zeroDevRpc) {
    throw new Error('ZERODEV_RPC is not set');
  }

  // STEP 1: Create backend validator signer with the PRIVATE key
  // This is the private counterpart to the public key used in the frontend
  const validatorSigner = await toECDSASigner({
    signer: privateKeyToAccount(kernelValidatorPrivateKey as Address)
  });

  // STEP 2: Deserialize the user-approved session key
  // Combines the user's authorization with our private key to create a complete session key
  const account = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    kernelVersion,
    serializedSessionKey,
    validatorSigner
  );

  // STEP 3: Create paymaster client for gas sponsorship
  // Allows the backend to pay for user transactions
  const paymasterClient = createZeroDevPaymasterClient({
    chain: baseSepolia,
    transport: http(serverEnv.ZERODEV_RPC)
  });

  // STEP 4: Create the kernel client with the session key account
  // This client can now execute transactions on behalf of the user within permitted scope
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
