/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const utils = require('../utils')

const makeMemoryCacher = ({ makeMiddleware, generateCacheKey, getDefaultOptions }, opts) => {
    const cache = {}
    let log
    let options_

    const init = ({ state, getLogger, bus, options, middlewareHandler }) => {
        options_ = getDefaultOptions(options)
        log = getLogger('CACHER')

        bus.on('$transporter.connected', () => {
            clear()
        })

        middlewareHandler.add(makeMiddleware({ set, get, generateCacheKey }))
        if (options.ttl) {
            setInterval(() => {
                checkTtl()
            }, options.ttl)
        }
    }

    const checkTtl = () => {
        const now = Date.now()
        const keys = Object.keys(cache)
        keys.forEach((hashKey) => {
            const item = cache[hashKey]
            if (item.expire && item.expire < now) {
                log.debug(`Delete ${hashKey}`)
                delete cache[hashKey]
            }
        })
    }

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

    const get = (cacheKey) => {
        const item = cache[cacheKey]
        if (item) {
            if (options_.ttl) {
                item.expire = Date.now() // + options_.ttl
            }
            log.debug(`Get ${cacheKey}`)
            return Promise.resolve(item.data)
        }
        return Promise.resolve(null)
    }

    const remove = (hashKey) => {
        delete cache[hashKey]
        log.debug(`Delete ${hashKey}`)
        return Promise.resolve()
    }

    const clear = (match = '**') => {
        Object.keys(cache).forEach(key => {
            if (utils.match(key, match)) {
                log.debug(`Delete ${key}`)
                remove(key)
            }
        })
    }

    return {
        init,
        clear
    }
}

module.exports = makeMemoryCacher
