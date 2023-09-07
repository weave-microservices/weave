import crypto from 'crypto';

export function createRandomString (length: number = 12): string {
  return crypto.randomBytes(length).toString('hex');
};
