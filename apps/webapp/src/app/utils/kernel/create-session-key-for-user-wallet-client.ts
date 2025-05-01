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
 * Create a session key for a user wallet
 */
export const createSessionKeyForUserWallet = async (
  userWalletSigner: Signer
): Promise<string> => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer: userWalletSigner,
    kernelVersion
  });

  const validatorEmptyAccount = addressToEmptyAccount(
    clientEnv.NEXT_PUBLIC_KERNEL_VALIDATOR_ADDRESS as Address
  );
  const validatorSessionKeySigner = await toECDSASigner({
    signer: validatorEmptyAccount
  });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    signer: validatorSessionKeySigner,
    policies: [
      // @todo session keys - proper policy planning
      toSudoPolicy({})
    ],
    kernelVersion: KERNEL_V3_1
  });

  const permissionAccount = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin
    },
    kernelVersion
  });

  // Triggers the user wallet to sign and approve the session key
  const serializedPermissionAccount =
    await serializePermissionAccount(permissionAccount);

  return serializedPermissionAccount;
};
