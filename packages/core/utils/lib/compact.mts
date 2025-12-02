/**
 * Remove falsy values from array
 * @param arr - Array to compact
 * @returns Compacted array
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}
