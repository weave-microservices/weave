/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { Cache } = require('@weave-js/core')

const makeRedisCache = (broker, options = {}) => {
  // prepare options
  options = Object.assign({
    port: 6379,
    host: '127.0.0.1',
    ttl: null
  }, options)

  const base = Cache.createCacheBase(broker, options)
  const name = 'Redis'

  let client
  broker.bus.on('$transport.connected', () => cache.clear())

  const cache = Object.assign(base, {
    name,
    init () {
      let Redis
      try {
        Redis = require('ioredis')
      } catch (error) {
        base.log.error('The package \'ioredis\' is not installed. Please install the package with \'npm install nats\'.')
        broker.errorHandler(error)
      }
      client = new Redis(options)

      client.on('connect', () => {
        /* istanbul ignore next */
        base.log.info('Redis cacher connected.')
      })

      client.on('error', (err) => {
        /* istanbul ignore next */
        base.log.error(err)
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

      base.log.debug(`Set ${hashKey}`)

      return Promise.resolve(data)
    },
    get (cacheKey) {
      return client.get(cacheKey).then(data => {
        if (data) {
          base.log.debug(`FOUND ${cacheKey}`)
          try {
            data = JSON.parse(data)
            return data
          } catch (error) {
            base.log.error('Redis result parse error', error, data)
          }
        }
        return null
      })
    },
    remove (hashKey) {
      return client.del(hashKey)
        .then(() => {
          base.log.debug(`Delete ${hashKey}`)
        })
    },
    clear (pattern = '*') {
      return new Promise((resolve) => {
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
          base.log.debug('Cache cleared')
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
