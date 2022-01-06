/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
const crypto = require('crypto')
const { isObject } = require('@weave-js/utils')
const Constants = require('../metrics/constants')

function getCacheKeyByObject (val) {
  if (Array.isArray(val)) {
    return val.map(object => getCacheKeyByObject(object)).join('/')
  } else if (isObject(val)) {
    return Object.keys(val).map(key => {
      return [key, getCacheKeyByObject(val[key])].join('/')
    }).join('/')
  } else if (val !== null) {
    return val.toString()
  } else {
    return 'null'
  }
}

function generateHash (key) {
  return crypto
    .createHash('sha1')
    .update(key)
    .digest('base64')
}

function registerCacheMetrics (metrics) {
  metrics.register({ type: 'counter', name: Constants.CACHE_GET_TOTAL })
  metrics.register({ type: 'counter', name: Constants.CACHE_SET_TOTAL })
  metrics.register({ type: 'counter', name: Constants.CACHE_FOUND_TOTAL })
  metrics.register({ type: 'counter', name: Constants.CACHE_EXPIRED_TOTAL })
  metrics.register({ type: 'counter', name: Constants.CACHE_DELETED_TOTAL })
  metrics.register({ type: 'counter', name: Constants.CACHE_CLEANED_TOTAL })
}

exports.createCacheBase = (runtime, options) => {
  const cache = {
    isConnected: false,
    runtime,
    options: Object.assign({
      ttl: null
    }, options),
    init () {
      // register metrics
      if (runtime.metrics) {
        this.metrics = runtime.metrics
        registerCacheMetrics(runtime.metrics)
      }
    },
    log: runtime.createLogger('CACHER'),
    set (/* hashKey, result, ttl */) {
      /* istanbul ignore next */
      runtime.handleError(new Error('Method not implemented.'))
    },
    get (/* hashKey */) {
      /* istanbul ignore next */
      runtime.handleError(new Error('Method not implemented.'))
    },
    remove () {
      /* istanbul ignore next */
      runtime.handleError(new Error('Method not implemented.'))
    },
    clear () {
      /* istanbul ignore next */
      runtime.handleError(new Error('Method not implemented.'))
    },
    stop () {
      /* istanbul ignore next */
      return Promise.resolve()
    },
    getCachingHash (actionName, params, meta, keys) {
      if (params || meta) {
        const prefix = `${actionName}:`

        if (keys) {
          if (keys.length === 1) {
            const value = params[keys[0]]
            const key = getCacheKeyByObject(value)
            return prefix + (isObject(value) ? key : value)
          }

          if (keys.length > 0) {
            const res = keys.reduce((pre, property, i) => {
              const value = params[property]
              let hash
              if (isObject(value)) {
                const key = getCacheKeyByObject(value)
                hash = generateHash(key)
              } else {
                hash = value
              }

              return pre + (i > 0 ? '|' : '') + hash
            }, prefix)
            return res
          }
        } else {
          return prefix + generateHash(getCacheKeyByObject(params))
        }
      }

      return actionName
    }
  }

  // cache.middleware = (runtime) => {
  //   return {
  //     localAction: (handler, action) => {
  //       const cacheOptions = Object.assign({ enabled: true }, isObject(action.cache) ? action.cache : { enabled: !!action.cache })
  //       if (cacheOptions.enabled) {
  //         return function cacheMiddleware (context, serviceInjections) {
  //           const cacheHashKey = runtime.cache.getCachingHash(action.name, context.data, context.meta, action.cache.keys)
  //           context.isCachedResult = false

  //           if (context.meta.$noCache === true) {
  //             return handler(context, serviceInjections)
  //           }

  //           if (runtime.cache.isConnected === false) {
  //             runtime.cache.log('Cache adapter is not connected yet. Call handler...')
  //             return handler(context, serviceInjections)
  //           }

  //           return runtime.cache.get(cacheHashKey).then((cachedResult) => {
  //             if (cachedResult !== null) {
  //               context.isCachedResult = true
  //               return cachedResult
  //             }

  //             return handler(context, serviceInjections).then((result) => {
  //               runtime.cache.set(cacheHashKey, result, action.cache.ttl)
  //               return result
  //             })
  //           })
  //         }
  //       }
  //       return handler
  //     }
  //   }
  // }

  return cache
}
