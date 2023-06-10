/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2023 Fachwerk
*/

const { defaultsDeep } = require('@weave-js/utils');
const { createLockStore, createInMemoryLockStoreAdapter } = require('@weave-js/lock-store');
const { getHash } = require('../utils/getHash');

const createLockService = (lockServiceOptions = {}) => {
  lockServiceOptions = defaultsDeep(lockServiceOptions, {
    name: '$lock',
    adapter: createInMemoryLockStoreAdapter()
  });

  const service = {
    name: lockServiceOptions.name,
    actions: {
      handleLockStoreEvent: {
        params: {
          event: 'string',
          key: 'string',
          expiresAt: 'number',
          metadata: { type: 'object', optional: true }
        },
        async handler (context) {
          const { event } = context.data;
          const eventName = `${this.name}.${event}`;
          await context.emit(eventName, context.data);
        }
      },
      acquireLock: {
        params: {
          key: { type: 'string' },
          expiresAt: { type: 'number', optional: true, default: Number.MAX_SAFE_INTEGER },
          metadata: { type: 'object', optional: true }
        },
        async handler (context) {
          const { key, expiresAt, metadata } = context.data;
          if (expiresAt < Date.now()) {
            throw new Error('A lock must not expire in the past.');
          }

          const hash = getHash(key);
          await this.store.acquire(hash, expiresAt, metadata);
          return true;
        }
      },
      isLocked: {
        params: {
          key: { type: 'string' }
        },
        handler (context) {
          const { key } = context.data;
          const hash = getHash(key);
          return this.store.isLocked(hash);
        }
      },
      renewLock: {
        params: {
          key: { type: 'string' },
          expiresAt: { type: 'number' }
        },
        handler (context) {
          const { key, expiresAt } = context.data;
          if (expiresAt < Date.now()) {
            throw new Error('A lock must not expire in the past.');
          }
          const hash = getHash(key);
          return this.store.renew(hash, expiresAt);
        }
      },
      releaseLock: {
        params: {
          key: { type: 'string' }
        },
        handler (context) {
          const { key } = context.data;
          const hash = getHash(key);
          return this.store.release(hash);
        }
      },
      flush: {
        handler (context) {
          return this.store.flush();
        }
      }
    },
    created: async function () {
      const adapter = await lockServiceOptions.adapter;
      this.store = await createLockStore({ adapter });
    },
    started: async function () {
      await this.store.connect();
      this.store.eventBus.on('lock-created', (lock) => {
        this.actions.handleLockStoreEvent({
          event: 'lock-created',
          ...lock
        });
      });

      this.store.eventBus.on('lock-released', (lock) => {
        this.actions.handleLockStoreEvent({
          event: 'lock-released',
          ...lock
        });
      });

      this.store.eventBus.on('lock-renewed', (lock) => {
        this.actions.handleLockStoreEvent({
          event: 'lock-renewed',
          ...lock
        });
      });
    },
    stopped: async function () {
      await this.store.disconnect();
    }
  };

  return service;
};

module.exports = { createLockService };
