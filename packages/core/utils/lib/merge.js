const { isObject } = require('./is-object');

/**
 * Merge two objects shallowly, with arrays being concatenated.
 * @template {Object} T
 * @template S
 * @param {T} target - Target object to merge into
 * @param {S} source - Source object to merge from
 * @returns {T & S} Merged object
 * @example
 * merge({a: 1, b: [1, 2]}, {b: [3, 4], c: 3}); // {a: 1, b: [1, 2, 3, 4], c: 3}
 */
exports.merge = function merge (target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const tempTarget = Object.assign({}, target);

  Object.keys(source).forEach(key => {
    const targetValue = tempTarget[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      tempTarget[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      tempTarget[key] = merge(Object.assign({}, targetValue), sourceValue);
    } else {
      tempTarget[key] = sourceValue;
    }
  });

  return tempTarget;
};

/**
 * Deep merge multiple objects recursively.
 * Objects are merged deeply, arrays are concatenated.
 * @template T
 * @param {...Partial<T>} args - Objects to merge
 * @returns {T} Deep merged object
 * @example
 * deepMerge({a: {b: 1}}, {a: {c: 2}}, {d: 3}); // {a: {b: 1, c: 2}, d: 3}
 */
exports.deepMerge = function deepMerge (...args) {
  // Setup target object
  const newObj = {};

  // Merge the object into the newObj object
  const merge = function (obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If property is an object, merge properties
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop], obj[prop]);
        } else if (Array.isArray(newObj[prop]) && Array.isArray(obj[prop])) {
          newObj[prop] = newObj[prop].concat(obj[prop]);
        } else {
          newObj[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (let i = 0; i < args.length; i++) {
    merge(args[i]);
  }

  return newObj;
};
