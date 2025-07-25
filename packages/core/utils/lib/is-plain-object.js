/**
 * Checks if the given object is a plain object.
 * @param {any} object to check
 * @param {boolean} strict
 * @returns {boolean}
 */
exports.isPlainObject = function isPlainObject (object, strict = true) {
  if (object === null || object === undefined) {
    return false;
  }

  const instanceOfObject = object instanceof Object;
  const typeOfObject = typeof object === 'object';
  const constructorUndefined = object.constructor === undefined;
  const constructorObject = object.constructor === Object;
  const typeOfConstructorObject = typeof object.constructor === 'function';

  let result;

  if (strict === true) {
    result = (instanceOfObject || typeOfObject) && (constructorUndefined || constructorObject);
  } else {
    result = (constructorUndefined || typeOfConstructorObject);
  }

  return result;
};
