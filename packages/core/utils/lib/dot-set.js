const { isObject } = require('./is-object');

/**
 * Set a property on an object by dot-notated path string.
 * @template {Object} T
 * @param {T} object target object
 * @param {import('../types').Path<T>} path Dot notated path string
 * @param {any} value
 * @returns {T} Modified object
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

