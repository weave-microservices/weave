/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const Redis = require('ioredis')

const makeRedisCacher = ({ makeMiddleware, generateCacheKey, getDefaultOptions }, opts) => {
    let log
    let options_
    let redis

    const init = ({ use, getLogger, options }) => {
        options_ = getDefaultOptions(options)
        log = getLogger('REDIS_CACHE')
        use(makeMiddleware({ set, get, generateCacheKey }))

        redis = new Redis({
            port: 6379,
            host: '127.0.0.1'
        })
    }

    const set = (hashKey, data, ttl) => {
        data = JSON.stringify(data)
        if (ttl == null) {
            ttl = options_.ttl
        }

        if (ttl) {
            redis.setex(hashKey, ttl / 1000, data)
        } else {
            redis.set(hashKey, data)
        }
        log.debug(`Set ${hashKey}`)
        return Promise.resolve(data)
    }

    const get = (cacheKey) => {
        return redis.get(cacheKey).then(data => {
            if (data) {
                log.debug(`FOUND ${cacheKey}`)
                try {
                    data = JSON.parse(data)
                    return data
                } catch (error) {
                    log.error('Redis result parse error', error, data)
                }
            }
            return null
        })
    }

    const clear = () => {
        this.cache = {}
        log.debug(`Cache cleared`)
        return Promise.resolve()
    }

    const clean = (match = '**') => {
        // Object.keys(cache).forEach(key => {
        //     if (nanomatch.isMatch(key, match)) {
        //         this.logger.debug(`Delete ${key}`)
        //         this.remove(key)
        //     }
        // })
    }

    return {
        init,
        clear,
        clean
    }
}

module.exports = makeRedisCacher
