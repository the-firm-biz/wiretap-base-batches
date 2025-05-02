import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

const serverEnvSchema = z.object({
  NEYNAR_API_KEY: secretString,
  DATABASE_URL: secretString,
  SIWE_JWT_SECRET: secretString,
  ZERODEV_RPC: secretString,
  // For devx - validator private key only required if working with session keys
  KERNEL_VALIDATOR_PRIVATE_KEY: secretString.optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
