const { isObject } = require('./is-object');

/**
 * Set a property on an object using dot notation path.
 * Creates nested objects as needed if they don't exist.
 * @template {Object} T
 * @param {T} object - Target object to modify
 * @param {string} path - Dot notation path (e.g., 'a.b.c')
 * @param {any} value - Value to set at the path
 * @returns {T} Modified object
 * @example
 * const obj = {};
 * dotSet(obj, 'a.b.c', 123);
 * // obj is now {a: {b: {c: 123}}}
 */
exports.dotSet = function dotSet (object, path, value) {
  if (path.includes('.')) {
    const pathArray = path.split('.');
    return pathArray.reduce((obj, i, index) => {
      const isTargetProp = (index + 1) === pathArray.length;
      const currentIsOject = isObject(obj[i]);

      if (obj[i] === undefined && !isTargetProp) {
        obj[i] = {};
      } else if (!isTargetProp && currentIsOject) {
        return obj[i];
      } else if (isTargetProp) {
        obj[i] = value;
      } else {
        throw new Error(`The property "${i}" already exists and is not an object.`);
      }
      return obj[i];
    }, object);
  }

  object[path] = value;
  return object;
};

