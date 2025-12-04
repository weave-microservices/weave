/**
 * Checks if a value is an object.
 * @param obj - Value to check
 * @returns True if value is an object
 */
export function isObject(obj: unknown): obj is object {
  return obj != null && typeof obj === "object";
}
