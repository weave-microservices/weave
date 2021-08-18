/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { match } = require('@weave-js/utils')
const { createCacheBase } = require('./base')

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
    base.log.verbose('Transpot adapter connected. Cache is cleared.')
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
      const item = storage.get(cacheKey)

      if (item) {
        if (options.ttl) {
          item.expire = Date.now()//  + options_.ttl
        }

        this.log.debug(`Get ${cacheKey}`)

        return Promise.resolve(item.data)
      }
      return Promise.resolve(null)
    },
    set (hashKey, data, ttl) {
      if (ttl == null) {
        ttl = options.ttl
      }

      storage.set(hashKey, {
        data,
        expire: ttl ? Date.now() + ttl : null
      })

      this.log.debug(`Set ${hashKey}`)

      return Promise.resolve(data)
    },
    remove (hashKey) {
      storage.delete(hashKey)
      this.log.debug(`Delete ${hashKey}`)

      return Promise.resolve()
    },
    clear (pattern = '**') {
      storage.forEach((_, key) => {
        if (match(key, pattern)) {
          this.log.debug(`Delete ${key}`)
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
