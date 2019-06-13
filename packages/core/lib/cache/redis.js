/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const Redis = require('ioredis')
const createBase = require('./base')

const makeRedisCache = (broker, options = {}) => {
    // prepare options
    options = Object.assign({
        port: 6379,
        host: '127.0.0.1',
        ttl: null
    }, options)

    const base = createBase(broker, options)
    const name = 'Redis'

    let client
    broker.bus.on('$transport.connected', () => cache.clear())

    const cache = Object.assign(base, {
        name,
        init () {
            client = new Redis(options)

            client.on('connect', () => {
                /* istanbul ignore next */
                this.log.info('Redis cacher connected.')
            })

            client.on('error', (err) => {
                /* istanbul ignore next */
                this.log.error(err)
            })
        },
        set (hashKey, data, ttl) {
            data = JSON.stringify(data)
            if (ttl == null) {
                ttl = options.ttl
            }

            if (ttl) {
                client.setex(hashKey, ttl / 1000, data)
            } else {
                client.set(hashKey, data)
            }
            this.log.debug(`Set ${hashKey}`)
            return Promise.resolve(data)
        },
        get (cacheKey) {
            return client.get(cacheKey).then(data => {
                if (data) {
                    this.log.debug(`FOUND ${cacheKey}`)
                    try {
                        data = JSON.parse(data)
                        return data
                    } catch (error) {
                        this.log.error('Redis result parse error', error, data)
                    }
                }
                return null
            })
        },
        remove (hashKey) {
            return client.del(hashKey)
                .then(n => {
                    this.log.debug(`Delete ${hashKey}`)
                })
        },
        clear (pattern = '*') {
            return new Promise((resolve, reject) => {
                const stream = client.scanStream({
                    match: pattern
                })

                stream.on('data', (keys) => {
                    if (keys.length) {
                        var pipeline = client.pipeline()
                        keys.forEach(function (key) {
                            pipeline.del(key)
                        })
                        pipeline.exec()
                    }
                })

                stream.on('end', () => {
                    this.log.debug(`Cache cleared`)
                    return resolve()
                })
            })
        },
        stop () {
            return client.quit()
        }
    })

    return cache
}

module.exports = makeRedisCache
