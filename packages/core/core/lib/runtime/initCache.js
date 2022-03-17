const { isFunction } = require('@weave-js/utils');
const { WeaveError } = require('../errors');

exports.initCache = (runtime) => {
  if (runtime.options.cache && runtime.options.cache.enabled) {
    if (!isFunction(runtime.options.cache.adapter)) {
      throw new WeaveError('Invalid cache adapter.');
    }

    // Init cache adapter
    const cache = runtime.options.cache.adapter(runtime, runtime.options.cache);

    runtime.log.info(`Cache: ${cache.name}`);

    Object.defineProperty(runtime, 'cache', {
      value: cache
    });
  }
};
