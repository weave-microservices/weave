/**
 * Safe way to copy objects
 * @param object - Object to copy
 * @returns Copy of object
 */
export function safeCopy<T>(object: T): T {
  const cache = new WeakSet();
  return JSON.parse(
    JSON.stringify(object, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    }),
  );
}
