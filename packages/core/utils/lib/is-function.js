const asyncTag = '[object AsyncFunction]';
const funcTag = '[object Function]';
const genTag = '[object GeneratorFunction]';
const proxyTag = '[object Proxy]';

/**
 * Check if an object is an valid function.
 * @param {any} obj Object to check
 * @returns {boolean}
 */
exports.isFunction = (obj) => {
  const tag = Object.prototype.toString.call(obj);
  return tag === asyncTag || tag === funcTag || tag === genTag || tag === proxyTag;
};

