const { isObject } = require('@weave-js/utils')

module.exports = (runtime) => {
  return {
    localAction: (handler, action) => {
      const cacheOptions = Object.assign(
        isObject(action.cache) ? action.cache : { enabled: !!action.cache },
        runtime.options.cache
      )
      if (cacheOptions.enabled) {
        return function cacheMiddleware (context, serviceInjections) {
          const cache = runtime.cache
          const cacheHashKey = cache.getCachingHash(action.name, context.data, context.meta, action.cache.keys)
          context.isCachedResult = false

          if (context.meta.$noCache === true) {
            return handler(context, serviceInjections)
          }

          if (cache.isConnected === false) {
            cache.log('Cache adapter is not connected yet. Call handler...')
            return handler(context, serviceInjections)
          }

          if (cacheOptions.lock.enabled) {
            let cacheProm
            if (cacheOptions.lock.staleTime && cache.getWithTTl) {

            } else {
              cacheProm = runtime.cache.get(cacheHashKey)
            }

            return cacheProm.then((cachedResult) => {
              if (cachedResult !== null) {
                // Found a cached value. Skip calling handler and return our value
                context.isCachedResult = true
                return cachedResult
              }

              return cache.lock(cacheHashKey).then((release) => {
                return cache.get(cacheHashKey).then(cachedResult => {
                  if (cachedResult !== null) {
                    // Found a cached value. Skip calling handler and return our value
                    context.isCachedResult = true
                    return release().then(() => {
                      return cachedResult
                    })
                  }

                  return handler(context).then((result) => {
                    // Cache the value
                    cache.set(cacheHashKey, result, action.cache.ttl).then(() => {
                      // release the lock
                      release()
                    })
                    return result
                  })
                })
              })
            })
          }

          // Not using cache lock
          return runtime.cache.get(cacheHashKey).then((cachedResult) => {
            if (cachedResult !== null) {
              context.isCachedResult = true
              return cachedResult
            }

            return handler(context, serviceInjections).then((result) => {
              runtime.cache.set(cacheHashKey, result, action.cache.ttl)
              return result
            })
          })
        }
      }
      return handler
    }
  }
}
