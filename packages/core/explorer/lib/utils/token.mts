import { randomBytes } from "crypto";

/**
 * Generate a random token for UI authentication
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}
