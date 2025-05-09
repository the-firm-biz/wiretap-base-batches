import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

const isDev = process.env.NODE_ENV === 'development';
const optionalSecretString = isDev ? secretString.optional() : secretString;

const serverEnvSchema = z.object({
  NEYNAR_API_KEY: secretString,
  DATABASE_URL: secretString,
  SIWE_JWT_SECRET: secretString,
  /**
   * Optional strings in development
   */
  /** Glider API Key is only required if interacting with Glider API */
  GLIDER_API_KEY: optionalSecretString,
  /** Validator private key only required if working with session keys */
  KERNEL_VALIDATOR_PRIVATE_KEY: optionalSecretString,
  /** ZeroDev RPC only required if working with session keys */
  ZERODEV_RPC: optionalSecretString,
  /** For secure storage of session keys */
  SESSION_KEY_ENCRYPTION_SECRET: optionalSecretString
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
