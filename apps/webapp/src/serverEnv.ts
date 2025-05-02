import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

const serverEnvSchema = z.object({
  NEYNAR_API_KEY: secretString,
  ALCHEMY_API_KEY: secretString,
  DATABASE_URL: secretString,
  SIWE_JWT_SECRET: secretString
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = getEnv(serverEnvSchema);
