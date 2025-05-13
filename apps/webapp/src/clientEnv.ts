import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string(),
  NEXT_PUBLIC_ALCHEMY_API_KEY: z.string(),
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string(),
  // For devx - validator address only required if working with session keys
  NEXT_PUBLIC_KERNEL_VALIDATOR_ADDRESS: z.string().optional()
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const clientEnvValues = {
  NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  NEXT_PUBLIC_KERNEL_VALIDATOR_ADDRESS:
    process.env.NEXT_PUBLIC_KERNEL_VALIDATOR_ADDRESS,
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY
};

// Doesn't make use of the getEnv util because of how NextJs handles client-side env variables
export const clientEnv = clientEnvSchema.parse(clientEnvValues);
