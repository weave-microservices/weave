import crypto from 'node:crypto';

/**
 * Create a random string
 * @param length - Length of the string
 * @returns Random hex string
 */
export function createRandomString(length: number = 12): string {
  return crypto.randomBytes(length).toString('hex');
}
