/**
 * Wraps a value in an array if it's not already an array.
 * @param object - The value to wrap in an array
 * @returns The value as an array
 */
export function wrapInArray<T>(object: T | T[]): T[] {
  return Array.isArray(object) ? object : [object];
}
