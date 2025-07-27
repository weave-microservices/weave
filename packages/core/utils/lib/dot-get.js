/**
 * Get a value from an object using dot notation path.
 * @template T
 * @param {T} object - Target object to get value from
 * @param {string} key - Dot notation path (e.g., 'a.b.c')
 * @returns {any} The value at the specified path
 * @example
 * dotGet({a: {b: {c: 123}}}, 'a.b.c'); // 123
 * dotGet({name: 'John'}, 'name'); // 'John'
 */
exports.dotGet = function dotGet (object, key) {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, i) => obj[i], object);
  }

  return object[key];
};
