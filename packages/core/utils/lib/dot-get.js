/**
 * Get a value from an object by path
 * @template T
 * @param {T} object Target Object
 * @param {import('../types').Path<T>} key path
 * @returns {any} Result
 */
exports.dotGet = function dotGet (object, key) {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, i) => obj[i], object);
  }

  return object[key];
};
