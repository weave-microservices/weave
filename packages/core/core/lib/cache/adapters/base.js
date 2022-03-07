/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
const crypto = require('crypto')
const { isObject, dotGet, isString } = require('@weave-js/utils')
const Constants = require('../../metrics/constants')
const { WeaveError } = require('../../errors')

/**
 * Get property from data or metadata object.
 * @param {any} data data object
 * @param {object} metadata metadata object
 * @param {string} key key
 * @returns {any} Result
 */
function getPropertyFromDataOrMetadata (data, metadata, key) {
  // if a key starts with ":", the property is picked from metadata
  if (key.startsWith(':')) {
    // remove ':' from key.
    key = key.replace(':', '')
    return dotGet(metadata, key)
  }
  return dotGet(data, key)
}

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

const createCacheBase = (name, runtime, adapterOptions, options) => {
  if (!isString(name)) {
    throw new WeaveError('Name must be a string.')
  }

  const cache = {
    name,
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
    getCachingKey (actionName, data, metadata, keys) {
      if (data || metadata) {
        const prefix = actionName + ':'

        if (keys) {
          // fast path for single keys
          if (keys.length === 1) {
            const value = getPropertyFromDataOrMetadata(data, metadata, keys[0])
            const key = getCacheKeyByObject(value)
            return prefix + (isObject(value) ? key : value)
          }

          // Handle data cache keys
          if (keys.length > 0) {
            const res = keys.reduce((pre, property, index) => {
              const value = getPropertyFromDataOrMetadata(data, metadata, property)
              let hash
              if (isObject(value)) {
                const key = getCacheKeyByObject(value)
                hash = generateHash(key)
              } else {
                hash = value
              }

              return pre + (index > 0 ? '|' : '') + hash
            }, prefix)
            return res
          }
        } else {
          return prefix + generateHash(getCacheKeyByObject(data))
        }
      }

      return actionName
    }
  }

  Object.defineProperty(cache, 'adapterOptions', {
    value: adapterOptions,
    writable: false
  })

  return cache
}

module.exports = { createCacheBase }
