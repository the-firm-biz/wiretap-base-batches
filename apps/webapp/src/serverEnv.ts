import { z } from 'zod';
import { getEnv } from '@wiretap/utils/shared';

const isDev = process.env.NODE_ENV === 'development';
const optionalInDevString = isDev ? z.string().optional() : z.string();

const serverEnvSchema = z.object({
  SERVER_ALCHEMY_API_KEY: z.string(),
  NEYNAR_API_KEY: z.string(),
  DATABASE_URL: z.string(),
  SIWE_JWT_SECRET: z.string(),
  /**
   * Optional strings in development
   */
  /** Glider API Key is only required if interacting with Glider API */
  GLIDER_API_KEY: optionalInDevString,
  /** Validator private key only required if working with session keys */
  KERNEL_VALIDATOR_PRIVATE_KEY: optionalInDevString,
  /** ZeroDev RPC only required if working with session keys */
  ZERODEV_RPC: optionalInDevString,
  /** For secure storage of session keys */
  SESSION_KEY_ENCRYPTION_SECRET: optionalInDevString
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
