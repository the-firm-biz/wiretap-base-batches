import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

const serverEnvSchema = z.object({
  NEYNAR_API_KEY: secretString,
  DATABASE_URL: secretString,
  SIWE_JWT_SECRET: secretString,
  // Glider API Key is only required if interacting with Glider API
  GLIDER_API_KEY: secretString.optional(),
  // Validator private key only required if working with session keys
  KERNEL_VALIDATOR_PRIVATE_KEY: secretString.optional(),
  // ZeroDev RPC only required if working with session keys
  ZERODEV_RPC: secretString,
  // For secure storage of session keys
  SESSION_KEY_ENCRYPTION_SECRET: secretString.optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
