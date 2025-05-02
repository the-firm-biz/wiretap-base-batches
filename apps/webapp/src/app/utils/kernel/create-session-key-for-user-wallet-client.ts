import { createKernelAccount, addressToEmptyAccount } from '@zerodev/sdk';
import { toECDSASigner } from '@zerodev/permissions/signers';
import { toSudoPolicy } from '@zerodev/permissions/policies';
import {
  serializePermissionAccount,
  toPermissionValidator
} from '@zerodev/permissions';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { Address, createPublicClient, http } from 'viem';
import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants';
import { Signer } from '@zerodev/sdk/types';
import { baseSepolia } from 'viem/chains';
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
 * Creates a session key following ZeroDev's "agent-created" pattern
 *
 * 1. The backend (agent) uses its validator address as the public key
 * 2. This public key is shared with the user wallet (owner) for authorization
 * 3. The user signs to approve the session key permissions
 *
 * @param userWalletSigner - User's wallet signer (from wagmi useWalletClient)
 * @returns Serialized permission account
 */
export const createSessionKeyForUserWallet = async (
  userWalletSigner: Signer
): Promise<string> => {
  const kernelValidatorAddress = clientEnv.NEXT_PUBLIC_KERNEL_VALIDATOR_ADDRESS;

  if (!kernelValidatorAddress) {
    throw new Error('KERNEL_VALIDATOR_ADDRESS is not set');
  }

  // STEP 1: Create an "empty account" for backend validator
  // We only need the public address for authorization, not the private key
  const validatorEmptyAccount = addressToEmptyAccount(
    kernelValidatorAddress as Address
  );
  const validatorSessionKeySigner = await toECDSASigner({
    signer: validatorEmptyAccount
  });

  // STEP 2: Create session key validator with permissions
  // This defines what actions the backend can perform on behalf of the user
  const sessionKeyValidator = await toPermissionValidator(publicClient, {
    entryPoint,
    signer: validatorSessionKeySigner,
    policies: [
      // @todo session keys - proper policy planning
      toSudoPolicy({})
    ],
    kernelVersion: KERNEL_V3_1
  });

  // STEP 3: Create user's ECDSA validator using their Signer
  const userValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer: userWalletSigner,
    kernelVersion
  });

  // STEP 4: Create kernel account with both validators
  // Combining user validator (sudo) with session key validator (regular)
  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: userValidator,
      regular: sessionKeyValidator
    },
    kernelVersion
  });

  // STEP 5: Serialize the permission account
  // This is when the user will be prompted to sign and authorize the session key
  const serializedPermissionAccount =
    await serializePermissionAccount(sessionKeyAccount);

  return serializedPermissionAccount;
};
