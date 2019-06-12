/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const utils = require('../utils')
const createBase = require('./base')

const makeMemoryCache = (broker, options = {}) => {
    const base = createBase(broker, options)
    const storage = {}
    const name = 'Memory'

    options = Object.assign(options, {
        ttl: 3000
    })

    // if a new broker gets connected, we need to clear the cache
    broker.bus.on('$transport.connected', () => cache.clear())

    const checkTtl = () => {
        const now = Date.now()
        const keys = Object.keys(storage)
        keys.forEach((hashKey) => {
            const item = storage[hashKey]
            if (item.expire && item.expire < now) {
                cache.log.debug(`Delete ${hashKey}`)
                delete storage[hashKey]
            }
        })
    }

    const cache = Object.assign(base, {
        name,
        get (cacheKey) {
            const item = storage[cacheKey]
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
            storage[hashKey] = {
                data,
                expire: ttl ? Date.now() + ttl : null
            }
            this.log.debug(`Set ${hashKey}`)
            return Promise.resolve(data)
        },
        remove (hashKey) {
            delete cache[hashKey]
            this.log.debug(`Delete ${hashKey}`)
            return Promise.resolve()
        },
        clear (match = '**') {
            Object.keys(cache).forEach(key => {
                if (utils.match(key, match)) {
                    this.log.debug(`Delete ${key}`)
                    this.remove(key)
                }
            })
        }
    })

    if (options.ttl) {
        setInterval(() => {
            checkTtl()
        }, options.ttl)
    }

    return cache
}

module.exports = makeMemoryCache
