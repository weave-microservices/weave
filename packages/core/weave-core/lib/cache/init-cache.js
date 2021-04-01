const Cache = require('../cache')

exports.initCache = (runtime) => {
  if (runtime.options.cache && runtime.options.cache.enabled) {
    const createCache = Cache.resolve(runtime.options.cache.adapter)
    Object.defineProperty(runtime, 'cache', {
      value: createCache(runtime, runtime.options.cache)
    })
  }
}
