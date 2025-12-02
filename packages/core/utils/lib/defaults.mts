import { isObject } from './is-object.mts';

/**
 * Merge settings with default options.
 * @param settings - Settings object
 * @param defaults - Default settings
 * @returns Merged settings with defaults
 */
export function defaultsDeep<T = any, K = any>(settings: K, defaults?: T): K & T {
  const target = Object(settings) as any;

  if (!defaults || target == null) {
    return target;
  }

  const keys = Object.keys(defaults);
  const le = keys.length;

  for (let i = 0; i < le; i++) {
    const key = keys[i];

    if (target[key] === void 0) {
      target[key] = (defaults as any)[key];
    } else if (isObject(target[key])) {
      target[key] = defaultsDeep(target[key], (defaults as any)[key]);
    }
  }

  return target;
}
