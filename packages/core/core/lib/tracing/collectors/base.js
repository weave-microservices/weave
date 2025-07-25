const { isObject, pick } = require('@weave-js/utils');

/**
 * Create a base tracing collector
 * @param {import('../../../types').Runtime} runtime
 * @returns {import('../../../types').TracingCollector}
 */
exports.createBaseTracingCollector = (runtime) => {
  const baseTracingCollector = Object.create(null);

  baseTracingCollector.options = runtime.tracer.options;

  baseTracingCollector.init = (runtime) => {
    baseTracingCollector.runtime = runtime;
    baseTracingCollector.tracer = runtime.tracer;
  };

  baseTracingCollector.startedSpan = () => {
    // throw new WeaveError('not implemented.')
  };

  baseTracingCollector.finishedSpan = () => {
    // throw new WeaveError('not implemented.')
  };

  baseTracingCollector.stop = () => {
    // throw new WeaveError('not implemented.')
  };

  /**
   * Flatten an object.
   * @param {object} obj Object
   * @param {boolean?} convertToString
   * @param {string?} path
   * @returns {object}
   */
  baseTracingCollector.flattenTags = (obj, convertToString = false, path = '') => {
    if (!obj) {
      return null;
    }

    return Object.keys(obj).reduce((res, k) => {
      const o = obj[k];
      const pp = (path ? path + '.' : '') + k;

      if (isObject(o)) {
        Object.assign(res, baseTracingCollector.flattenTags(o, convertToString, pp));
      } else if (o !== undefined) {
        res[pp] = convertToString ? String(o) : o;
      }

      return res;
    }, {});
  };

  /**
   * Get fields of an error object.
   * @param {Error} error Error
   * @param {string[]} fields
   * @returns
   */
  baseTracingCollector.getErrorFields = (error, fields) => {
    if (!error) {
      return null;
    }
    return pick(error, fields);
  };

  return baseTracingCollector;
};
