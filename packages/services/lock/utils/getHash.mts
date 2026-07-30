import crypto from "crypto";

/**
 * Hashes a lock key so that the store never sees the raw value.
 */
export const getHash = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
