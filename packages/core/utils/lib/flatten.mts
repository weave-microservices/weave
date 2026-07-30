/**
 * Flattens an array of arrays into a single array (one level deep).
 * @param arr - Array of arrays to flatten
 * @returns Flattened array
 * @example
 * flatten([[1, 2], [3, 4], [5]]); // [1, 2, 3, 4, 5]
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce((a: T[], b: T | T[]) => {
    return a.concat(b);
  }, []);
}
