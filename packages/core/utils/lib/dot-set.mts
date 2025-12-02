import { isObject } from './is-object.mts';

/**
 * Set a property on an object using dot notation path.
 * Creates nested objects as needed if they don't exist.
 * @param object - Target object to modify
 * @param path - Dot notation path (e.g., 'a.b.c')
 * @param value - Value to set at the path
 * @returns Modified object
 * @example
 * const obj = {};
 * dotSet(obj, 'a.b.c', 123);
 * // obj is now {a: {b: {c: 123}}}
 */
export function dotSet<T extends object>(object: T, path: string, value: unknown): T {
  if (path.includes('.')) {
    const pathArray = path.split('.');
    pathArray.reduce((obj: Record<string, unknown>, i, index) => {
      const isTargetProp = (index + 1) === pathArray.length;
      const currentIsObject = isObject(obj[i]);

      if (obj[i] === undefined && !isTargetProp) {
        obj[i] = {};
      } else if (!isTargetProp && currentIsObject) {
        return obj[i] as Record<string, unknown>;
      } else if (isTargetProp) {
        obj[i] = value;
      } else {
        throw new Error(`The property "${i}" already exists and is not an object.`);
      }
      return obj[i] as Record<string, unknown>;
    }, object as Record<string, unknown>);
    return object;
  }

  (object as Record<string, unknown>)[path] = value;
  return object;
}
