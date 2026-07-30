import { isObject } from "./is-object.mts";

/**
 * Merge settings with default options.
 * @param settings - Settings object
 * @param defaults - Default settings
 * @returns Merged settings with defaults
 */
export function defaultsDeep<T = unknown, K = unknown>(settings: K, defaults?: T): K & T {
  const target = Object(settings) as Record<string, unknown>;

  if (!defaults || target == null) {
    return target as K & T;
  }

  const keys = Object.keys(defaults as object);
  const le = keys.length;

  for (let i = 0; i < le; i++) {
    const key = keys[i];

    if (target[key] === void 0) {
      target[key] = (defaults as Record<string, unknown>)[key];
    } else if (isObject(target[key])) {
      target[key] = defaultsDeep(target[key], (defaults as Record<string, unknown>)[key]);
    }
  }

  return target as K & T;
}
