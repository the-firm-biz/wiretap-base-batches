import crypto from 'crypto';
import { serverEnv } from '@/serverEnv';

// Use a fixed IV length for AES-256-CBC
const IV_LENGTH = 16;

/**
 * Encrypts a serialized session key for secure storage
 *
 * @param serializedSessionKey - The serialized session key to encrypt
 * @returns The encrypted session key as a base64 string
 */
export const encryptSessionKey = (serializedSessionKey: string): string => {
  const ENCRYPTION_KEY = serverEnv.SESSION_KEY_ENCRYPTION_SECRET;
  if (!ENCRYPTION_KEY) {
    throw new Error('SESSION_KEY_ENCRYPTION_SECRET is not set');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(serializedSessionKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Prepend the IV to the encrypted data and return as base64
  return Buffer.concat([iv, Buffer.from(encrypted, 'base64')]).toString(
    'base64'
  );
};

/**
 * Decrypts an encrypted session key
 *
 * @param encryptedSessionKey - The encrypted session key as a base64 string
 * @returns The decrypted serialized session key
 */
export const decryptSessionKey = (encryptedSessionKey: string): string => {
  const ENCRYPTION_KEY = serverEnv.SESSION_KEY_ENCRYPTION_SECRET;
  if (!ENCRYPTION_KEY) {
    throw new Error('SESSION_KEY_ENCRYPTION_SECRET is not set');
  }

  const encryptedBuffer = Buffer.from(encryptedSessionKey, 'base64');

  // Extract the IV from the first 16 bytes
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  // Get the encrypted data (everything after the IV)
  const encryptedData = encryptedBuffer.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let decrypted = decipher.update(encryptedData, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
