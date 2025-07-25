/**
 * Clone an object.
 * @template T
 * @param {T} obj Object to clone.
 * @returns {T}
 */
exports.clone = function clone (obj) {
  // in case of primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // date objects should be
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // handle Array
  if (Array.isArray(obj)) {
    const clonedArr = [];
    obj.forEach(function (element) {
      clonedArr.push(clone(element));
    });
    return clonedArr;
  }

  // lastly, handle objects
  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      clonedObj[prop] = clone(obj[prop]);
    }
  }

  return clonedObj;
};
