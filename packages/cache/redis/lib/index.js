/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { Cache } = require('@weave-js/core');
const { defaultsDeep } = require('@weave-js/utils');
const Redis = require('ioredis');
const defaultAdapterOptions = {
  port: 6379,
  host: '127.0.0.1'
};

const createRedisCache = (adapterOptions = {}) => (runtime, options = {}) => {
  adapterOptions = defaultsDeep(adapterOptions, defaultAdapterOptions);

  const base = Cache.createCacheBase('Redis', runtime, adapterOptions, options);

  let client;
  runtime.bus.on('$transport.connected', () => cache.clear());

  const cache = Object.assign(base, {
    init () {
      client = new Redis(adapterOptions);

      client.on('connect', () => {
        cache.isConnected = true;
        /* istanbul ignore next */
        base.log.info('Redis cacher connected.');
      });

      client.on('error', (err) => {
        cache.isConnected = false;
        /* istanbul ignore next */
        base.log.error('Redis cache error:', err);
      });

      client.on('close', () => {
        cache.isConnected = false;
        /* istanbul ignore next */
        base.log.warn('Redis cache connection closed.');
      });
    },
    set (hashKey, data, ttl) {
      data = JSON.stringify(data);
      if (ttl == null) {
        ttl = options.ttl;
      }

      if (ttl) {
        client.setex(hashKey, ttl / 1000, data);
      } else {
        client.set(hashKey, data);
      }

      base.log.debug(`Set ${hashKey}`);

      return Promise.resolve(data);
    },
    get (cacheKey) {
      return client.get(cacheKey).then(data => {
        if (data) {
          base.log.debug(`FOUND ${cacheKey}`);
          try {
            data = JSON.parse(data);
            return data;
          } catch (error) {
            base.log.error('Redis result parse error', error, data);
            return null;
          }
        }
        return null;
      });
    },
    remove (hashKey) {
      return client.del(hashKey)
        .then(() => {
          base.log.debug(`Delete ${hashKey}`);
        });
    },
    clear (pattern = '*') {
      return new Promise((resolve, reject) => {
        const stream = client.scanStream({
          match: pattern
        });

        stream.on('data', (keys) => {
          if (keys.length) {
            const pipeline = client.pipeline();
            keys.forEach(function (key) {
              pipeline.del(key);
            });
            pipeline.exec().catch(err => {
              base.log.error('Error executing pipeline:', err);
            });
          }
        });

        stream.on('end', () => {
          base.log.debug('Cache cleared');
          resolve();
        });

        stream.on('error', (err) => {
          base.log.error('Error clearing cache:', err);
          reject(err);
        });
      });
    },
    stop () {
      return client.quit();
    }
  });

  return cache;
};

module.exports = { createRedisCache };
