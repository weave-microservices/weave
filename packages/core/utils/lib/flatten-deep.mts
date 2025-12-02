/**
 * Deep flattens an array
 * @param array - Array to flatten
 * @returns Flattened array
 */
export function flattenDeep<T>(array: unknown[]): T[] {
  return array.reduce((acc: T[], e: unknown) => {
    if (Array.isArray(e)) {
      return acc.concat(flattenDeep(e));
    } else {
      return acc.concat(e as T);
    }
  }, []);
}
