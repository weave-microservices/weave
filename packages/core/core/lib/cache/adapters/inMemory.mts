/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { match, defaultsDeep } from '@weave-js/utils';
import { createCacheBase } from './base.mts';
import { createLock } from '../lock.mts';
import * as Constants from '../../metrics/constants.mts';
import type { Runtime } from '../../../types/index.js';

const defaultAdapterOptions = {
  ttlCheckInterval: 3000
};

/**
 * @typedef {Object} InMemoryAdapterOptions
 * @property {number=} ttlCheckInterval TTL check interval
*/

/**
 * @param {InMemoryAdapterOptions} adapterOptions Adapter options
 * @returns {any} CacheFactory
*/
export const createInMemoryCache = (adapterOptions = {}) => (runtime: Runtime, options = {}) => {
  adapterOptions = defaultsDeep(adapterOptions, defaultAdapterOptions);
  const base = createCacheBase('In-Memory', runtime, adapterOptions, options);
  const storage = new Map();
  const lock = createLock();

  const ttlTimerHandle = setInterval(() => {
    checkTtl();
  }, adapterOptions.ttlCheckInterval);

  ttlTimerHandle.unref();

  runtime.bus.on('$transport.connected', () => {
    base.log.debug('Transport adapter connected. Cache will be cleared.');
    cache.clear();
  });

  const checkTtl = () => {
    const now = Date.now();

    storage.forEach((item, hashKey) => {
      if (item.expire && item.expire < now) {
        cache.log.debug(`Delete ${hashKey}`);
        storage.delete(hashKey);
      }
    });
  };

  const cache = Object.assign(
    {},
    base,
    {
      init () {
        base.init();
        cache.isConnected = true;
      },
      get (cacheKey: string) {
        base.log.debug(`Get ${cacheKey}`);

        if (base.metrics) {
          base.metrics.increment(Constants.CACHE_GET_TOTAL);
        }

        const item = storage.get(cacheKey);

        if (item) {
          cache.log.debug(`Found ${cacheKey}`);

          if (base.metrics) {
            base.metrics.increment(Constants.CACHE_FOUND_TOTAL);
          }

          if (item.expire && item.expire < Date.now()) {
            cache.log.debug(`Delete ${cacheKey}`);
            storage.delete(cacheKey);
            if (base.metrics) {
              base.metrics.increment(Constants.CACHE_EXPIRED_TOTAL);
            }
            return Promise.resolve(null);
          }

          return Promise.resolve(item.data);
        }
        return Promise.resolve(null);
      },
      set (hashKey: string, data: any, ttl: number) {
        if (base.metrics) {
          base.metrics.increment(Constants.CACHE_SET_TOTAL);
        }

        if (ttl == null) {
          ttl = options.ttl;
        }

        storage.set(hashKey, {
          data,
          expire: ttl ? Date.now() + ttl : null
        });

        base.log.debug(`Set ${hashKey}`);

        return Promise.resolve(data);
      },
      remove (hashKey) {
        if (base.metrics) {
          base.metrics.increment(Constants.CACHE_DELETED_TOTAL);
        }
        storage.delete(hashKey);
        base.log.debug(`Delete cached object with key ${hashKey}`);

        return Promise.resolve();
      },
      clear (pattern: string = '**') {
        if (base.metrics) {
          base.metrics.increment(Constants.CACHE_DELETED_TOTAL);
        }

        storage.forEach((_, key) => {
          if (match(key, pattern)) {
            this.remove(key);
          }
        });
        return Promise.resolve();
      },
      lock (key: string, ttl: number) {
        return lock.acquire(key, ttl).then(() => {
          return () => lock.release(key);
        });
      },
      tryAcquireLock (key: string, ttl: number) {
        if (lock.isLocked(key)) {
          return Promise.reject(new Error('Locked'));
        }

        return lock.acquire(key, ttl).then(() => {
          return () => lock.release(key);
        });
      },
      async stop () {
        clearInterval(ttlTimerHandle);
      }
    });
  return cache;
};

