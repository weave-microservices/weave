/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const utils = require('../utils')
const createBase = require('./base')

const makeMemoryCache = (broker, options = {}) => {
  const base = createBase(broker, options)
  const storage = new Map()
  const name = 'Memory'

  const timer = setInterval(() => {
    checkTtl()
  }, options.ttl)

  timer.unref()

  // if a new broker gets connected, we need to clear the cache
  broker.bus.on('$transport.connected', () => cache.clear())

  const checkTtl = () => {
    const now = Date.now()
    storage.forEach((item, hashKey) => {
      if (item.expire && item.expire < now) {
        cache.log.debug(`Delete ${hashKey}`)
        delete storage[hashKey]
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
    clear (match = '**') {
      storage.forEach((item, key) => {
        if (utils.match(key, match)) {
          this.log.debug(`Delete ${key}`)
          this.remove(key)
        }
      })
    }
  })

  return cache
}

module.exports = makeMemoryCache
