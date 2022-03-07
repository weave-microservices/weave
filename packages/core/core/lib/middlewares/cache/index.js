const { isString, isFunction } = require('@weave-js/utils')

module.exports = (runtime) => {
  return {
    localAction: (handler, action) => {
      const cacheOptions = runtime.options.cache
      const cacheActionOptions = {
        enabled: !!action.cache
      }

      if (isString(action.cache)) {
        cacheActionOptions.keys = action.cache.split(' ')
      } else if (action.cache && Array.isArray(action.cache.keys)) {
        cacheActionOptions.keys = action.cache.keys
      }

      if (cacheActionOptions.enabled) {
        const cache = runtime.cache
        const isEnabledFunction = isFunction(action.cache.condition)

        return function cacheMiddleware (context, serviceInjections) {
          // handle enabled function
          if (isEnabledFunction) {
            if (!action.cache.enabled.call(null, context)) {
              // Enabled function returns "false". Cache is disabled.
              return handler(context, serviceInjections)
            }
          }

          // Generate cache hash
          const cacheHashKey = cache.getCachingKey(
            action.name,
            context.data,
            context.meta,
            cacheActionOptions.keys
          )

          context.isCachedResult = false

          // Disable caching by meta property.
          if (context.meta.$noCache === true) {
            return handler(context, serviceInjections)
          }

          // The cache adapter is not connected yet. In this case, we call the handler regular
          if (cache.isConnected === false) {
            cache.log('Cache adapter is not connected yet. Call handler...')
            return handler(context, serviceInjections)
          }

          if (cacheOptions.lock.enabled) {
            let cachePromise
            if (cacheOptions.lock.staleTime && cache.getWithTTl) {

            } else {
              cachePromise = runtime.cache.get(cacheHashKey)
            }

            return cachePromise.then((cachedResult) => {
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
