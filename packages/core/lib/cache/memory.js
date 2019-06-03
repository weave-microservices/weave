/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const utils = require('../utils')
const createBase = require('./base')

const makeMemoryCache = (broker, opts) => {
    const base = createBase(broker, opts)
    const storage = {}
    const name = 'Memory'
    let options_ = {
        ttl: 3000
    }

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
                if (options_.ttl) {
                    item.expire = Date.now()//  + options_.ttl
                }
                this.log.debug(`Get ${cacheKey}`)
                return Promise.resolve(item.data)
            }
            return Promise.resolve(null)
        },
        set (hashKey, data, ttl) {
            if (ttl == null) {
                ttl = options_.ttl
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

    if (options_.ttl) {
        setInterval(() => {
            checkTtl()
        }, options_.ttl)
    }

    return cache

    // const init = ({ state, getLogger, bus, options, middlewareHandler }) => {
    //     options_ = getDefaultOptions(options)
    //     log = getLogger('CACHER')

    //     bus.on('$transporter.connected', () => {
    //         clear()
    //     })

    //     middlewareHandler.add(makeMiddleware({ set, get, generateCacheKey }))

    //     if (options.ttl) {
    //         setInterval(() => {
    //             checkTtl()
    //         }, options.ttl)
    //     }
    // }

    // const checkTtl = () => {
    //     const now = Date.now()
    //     const keys = Object.keys(cache)
    //     keys.forEach((hashKey) => {
    //         const item = cache[hashKey]
    //         if (item.expire && item.expire < now) {
    //             log.debug(`Delete ${hashKey}`)
    //             delete cache[hashKey]
    //         }
    //     })
    // }

    const set = (hashKey, data, ttl) => {
        if (ttl == null) {
            ttl = options_.ttl
        }
        cache[hashKey] = {
            data,
            expire: ttl ? Date.now() + ttl : null
        }
        log.debug(`Set ${hashKey}`)
        return Promise.resolve(data)
    }

    // const get = (cacheKey) => {
    //     const item = cache[cacheKey]
    //     if (item) {
    //         if (options_.ttl) {
    //             item.expire = Date.now() + options_.ttl
    //         }
    //         log.debug(`Get ${cacheKey}`)
    //         return Promise.resolve(item.data)
    //     }
    //     return Promise.resolve(null)
    // }

    // const remove = (hashKey) => {
    //     delete cache[hashKey]
    //     log.debug(`Delete ${hashKey}`)
    //     return Promise.resolve()
    // }

    // const clear = (match = '**') => {
    //     Object.keys(cache).forEach(key => {
    //         if (utils.match(key, match)) {
    //             log.debug(`Delete ${key}`)
    //             remove(key)
    //         }
    //     })
    // }

    // return {
    //     name,
    //     init,
    //     clear
    // }
}

module.exports = makeMemoryCache
