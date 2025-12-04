/**
 * Get a value from an object using dot notation path.
 * @param object - Target object to get value from
 * @param key - Dot notation path (e.g., 'a.b.c')
 * @returns The value at the specified path
 * @example
 * dotGet({a: {b: {c: 123}}}, 'a.b.c'); // 123
 * dotGet({name: 'John'}, 'name'); // 'John'
 */
export function dotGet<T = unknown>(object: unknown, key: string): T | undefined {
  if (key.includes(".")) {
    return key.split(".").reduce((obj, i) => (obj as Record<string, unknown>)?.[i], object) as
      | T
      | undefined;
  }

  return (object as Record<string, unknown>)?.[key] as T | undefined;
}
