import { dotGet } from "./dot-get.mts";
import { dotSet } from "./dot-set.mts";

/**
 * Pick properties from an object by their keys.
 * Supports dot notation for nested properties.
 * @param object - Source object to pick properties from
 * @param props - Array of property paths to pick (supports dot notation)
 * @returns New object containing only the picked properties
 * @example
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']); // {a: 1, c: 3}
 * pick({user: {name: 'John', age: 30}}, ['user.name']); // {user: {name: 'John'}}
 */
export function pick<T extends object, K extends keyof T>(
  object: T,
  props: (K | string)[],
): Partial<T> {
  const picked: Record<string, unknown> = {};

  for (const prop of props) {
    dotSet(picked, prop as string, dotGet(object, prop as string));
  }

  return picked as Partial<T>;
}
