/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { match } = require('@weave-js/utils')
const { createCacheBase } = require('./base')
const Constants = require('../metrics/constants')

const makeMemoryCache = (runtime, options = {}) => {
  const base = createCacheBase(runtime, options)
  const storage = new Map()
  const name = 'Memory'

  const timer = setInterval(() => {
    checkTtl()
  }, 3000)

  timer.unref()

  // if a new broker gets connected, we need to clear the cache
  runtime.bus.on('$transport.connected', () => {
    base.log.verbose('Transport adapter connected. Cache will be cleared.')
    cache.clear()
  })

  const checkTtl = () => {
    const now = Date.now()

    storage.forEach((item, hashKey) => {
      if (item.expire && item.expire < now) {
        cache.log.debug(`Delete ${hashKey}`)
        storage.delete(hashKey)
      }
    })
  }

  const cache = Object.assign(base, {
    name,
    get (cacheKey) {
      base.log.debug(`Get ${cacheKey}`)

      if (this.metrics) {
        this.metrics.increment(Constants.CACHE_GET_TOTAL)
      }

      const item = storage.get(cacheKey)

      if (item) {
        cache.log.debug(`Found ${cacheKey}`)

        if (this.metrics) {
          this.metrics.increment(Constants.CACHE_FOUND_TOTAL)
        }

        // if (options.ttl) {
        //   item.expire = Date.now()//  + options_.ttl
        // }

        if (item.expire && item.expire < Date.now()) {
          cache.log.debug(`Delete ${cacheKey}`)
          storage.delete(cacheKey)
          if (this.metrics) {
            this.metrics.increment(Constants.CACHE_EXPIRED_TOTAL)
          }
          return Promise.resolve(null)
        }

        return Promise.resolve(item.data)
      }
      return Promise.resolve(null)
    },
    set (hashKey, data, ttl) {
      if (this.metrics) {
        this.metrics.increment(Constants.CACHE_SET_TOTAL)
      }

      if (ttl == null) {
        ttl = options.ttl
      }

      storage.set(hashKey, {
        data,
        expire: ttl ? Date.now() + ttl : null
      })

      base.log.debug(`Set ${hashKey}`)

      return Promise.resolve(data)
    },
    remove (hashKey) {
      if (this.metrics) {
        this.metrics.increment(Constants.CACHE_DELETED_TOTAL)
      }
      storage.delete(hashKey)
      base.log.debug(`Delete ${hashKey}`)

      return Promise.resolve()
    },
    clear (pattern = '**') {
      if (this.metrics) {
        this.metrics.increment(Constants.CACHE_DELETED_TOTAL)
      }
      storage.forEach((_, key) => {
        if (match(key, pattern)) {
          base.log.debug(`Delete ${key}`)
          this.remove(key)
        }
      })
      return Promise.resolve()
    },
    stop () {
      clearInterval(timer)
    }
  })

  return cache
}

module.exports = makeMemoryCache
