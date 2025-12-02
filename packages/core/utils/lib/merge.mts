import { isObject } from './is-object.mts';

/**
 * Merge two objects shallowly, with arrays being concatenated.
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged object
 * @example
 * merge({a: 1, b: [1, 2]}, {b: [3, 4], c: 3}); // {a: 1, b: [1, 2, 3, 4], c: 3}
 */
export function merge<T extends object, S extends object>(target: T, source: S): T & S {
  if (!isObject(target) || !isObject(source)) {
    return source as any;
  }

  const tempTarget = Object.assign({}, target) as any;

  Object.keys(source).forEach(key => {
    const targetValue = tempTarget[key];
    const sourceValue = (source as any)[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      tempTarget[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      tempTarget[key] = merge(Object.assign({}, targetValue), sourceValue);
    } else {
      tempTarget[key] = sourceValue;
    }
  });

  return tempTarget;
}

/**
 * Deep merge multiple objects recursively.
 * Objects are merged deeply, arrays are concatenated.
 * @param args - Objects to merge
 * @returns Deep merged object
 * @example
 * deepMerge({a: {b: 1}}, {a: {c: 2}}, {d: 3}); // {a: {b: 1, c: 2}, d: 3}
 */
export function deepMerge<T = unknown>(...args: Partial<T>[]): T {
  // Setup target object
  const newObj: Record<string, unknown> = {};

  const mergeObj = function (obj: Record<string, unknown>) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If property is an object, merge properties
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop] as Partial<unknown>, obj[prop] as Partial<unknown>);
        } else if (Array.isArray(newObj[prop]) && Array.isArray(obj[prop])) {
          newObj[prop] = (newObj[prop] as unknown[]).concat(obj[prop] as unknown[]);
        } else {
          newObj[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (let i = 0; i < args.length; i++) {
    mergeObj(args[i] as Record<string, unknown>);
  }

  return newObj as T;
}
