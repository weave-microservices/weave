/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { hash } = require('node-object-hash')({ sort: false, coerce: false })
const { isObject } = require('lodash')

const makeBaseCache = (broker, options) => {
  const cache = {
    options: Object.assign({
      ttl: null
    }, options),
    init () {
      return Promise.resolve()
    },
    log: broker.createLogger('CACHER'),
    set (/* hashKey, result, ttl */) {
      /* istanbul ignore next */
      throw new Error('Method not implemented.')
    },
    get (/* hashKey */) {
      /* istanbul ignore next */
      throw new Error('Method not implemented.')
    },
    remove () {
      /* istanbul ignore next */
      throw new Error('Method not implemented.')
    },
    clear () {
      /* istanbul ignore next */
      throw new Error('Method not implemented.')
    },
    stop () {
      /* istanbul ignore next */
      return Promise.resolve()
    },
    getCachingHash (actionName, params, keys) {
      if (params) {
        const prefix = `${actionName}:`
        if (keys) {
          if (keys.length === 1) {
            const value = params[keys[0]]
            return prefix + (isObject(value) ? hash(value) : value)
          }
          if (keys.length > 0) {
            const res = keys.reduce((p, key, i) => {
              const value = params[key]
              return p + (i ? '|' : '') + (isObject(value) ? hash(value) : value)
            }, prefix)
            return res
          }
        } else {
          return prefix + hash(params)
        }
      }
      return actionName
    }
  }

  cache.middleware = (handler, action) => {
    if (action.cache) {
      return function cacheMiddleware (context) {
        const cacheHashKey = cache.getCachingHash(action.name, context.params, action.cache.keys)
        context.isCachedResult = false
        return cache.get(cacheHashKey).then((content) => {
          if (content !== null) {
            context.isCachedResult = true
            return content
          }
          return handler(context).then((result) => {
            cache.set(cacheHashKey, result, action.cache.ttl)
            return result
          })
        })
      }
    }
    return handler
  }

  return cache
}
module.exports = makeBaseCache
