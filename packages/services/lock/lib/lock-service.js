/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
*/
const { defaultsDeep } = require('@weave-js/utils');
const { createLockStore } = require('@weave-js/lock-store');
const { getHash } = require('../utils/getHash');

const createLockService = (lockServiceOptions = {}) => {
  lockServiceOptions = defaultsDeep(lockServiceOptions, {
    name: '$lock',
    lockStore: createLockStore('InMemory')
  });

  const service = {
    name: lockServiceOptions.name,
    actions: {
      acquireLock: {
        params: {
          value: { type: 'string' },
          expiresAt: { type: 'number', optional: true, default: Number.MAX_SAFE_INTEGER }
        },
        async handler (context) {
          const { value, expiresAt } = context.data;
          if (expiresAt < Date.now()) {
            throw new Error('A lock must not expire in the past.');
          }

          const hash = getHash(value);
          await this.store.acquire(hash, expiresAt);
        }
      },
      isLocked: {
        params: {
          value: { type: 'string' }
        },
        handler (context) {
          const { value } = context.data;
          const hash = getHash(value);
          return this.store.isLocked(hash);
        }
      },
      renewLock: {
        params: {
          value: { type: 'string' },
          expiresAt: { type: 'number' }
        },
        handler (context) {
          const { value, expiresAt } = context.data;
          if (expiresAt < Date.now()) {
            throw new Error('A lock must not expire in the past.');
          }
          const hash = getHash(value);
          return this.store.renew(hash, expiresAt);
        }
      },
      releaseLock: {
        params: {
          value: { type: 'string' }
        },
        handler (context) {
          const { value } = context.data;
          const hash = getHash(value);
          return this.store.release(hash);
        }
      }
    },
    created: function () {
      this.store = lockServiceOptions.lockStore;
    }
  };

  return service;
};

module.exports = { createLockService };
