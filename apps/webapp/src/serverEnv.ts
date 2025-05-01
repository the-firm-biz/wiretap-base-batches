import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

const serverEnvSchema = z.object({
  NEYNAR_API_KEY: secretString,
  DATABASE_URL: secretString,
  SIWE_JWT_SECRET: secretString,
  ZERODEV_RPC: secretString,
  // @todo session keys - optionally declare in schema depending on env?
  KERNEL_VALIDATOR_PRIVATE_KEY: secretString
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
