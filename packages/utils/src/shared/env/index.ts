import { z } from 'zod';

/**
 * Util to retrieve and parse the environment variables given a zod schema
 */
export function getEnv<T extends z.ZodObject<Record<string, z.ZodTypeAny>>>(
  schema: T
) {
  const envKeys = Object.keys(schema.shape);
  const envObject = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]])
  );

  return schema.parse(envObject);
}

/**
 * Validate env boolean values are "0" or "1"
 * @note with zod 4.0.0, this can be replaced with z.stringbool()
 */
export const stringBool = z
  .string()
  .refine((val) => val === '1' || val === '0', {
    message: 'Must be "1" or "0"'
  });
