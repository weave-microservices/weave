/**
 * Safe way to copy objects
 * @template T
 * @param {T} object Object to copy
 * @returns {T} Copy
 */
exports.safeCopy = function safeCopy (object) {
  const cache = new WeakSet();
  return JSON.parse(JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return;
      }
      cache.add(value);
    }
    return value;
  }));
};
