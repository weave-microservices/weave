import { tagTester } from './helper/tag-tester.mts';

/**
 * Checks if a value is a string.
 * @param obj - Value to check
 * @returns True if value is a string
 */
export function isString(obj: unknown): obj is string {
  return tagTester('String')(obj);
}
