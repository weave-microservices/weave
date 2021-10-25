/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
*/
const { defaultsDeep } = require('@weave-js/utils')
const { getHash } = require('../utils/getHash')
const { createLockStore } = require('../stores/createLockStore')

const createLockService = (lockServiceOptions = {}) => {
  lockServiceOptions = defaultsDeep(lockServiceOptions,{
    name: '$lock',
    lockStore: createLockStore('InMemory')
  })

  const service = {
    name: lockServiceOptions.name,
    actions: {
      acquireLock: {
        params: {
          value: { type: 'string' },
          expiresAt: { type: 'number', optional: true, default: Number.MAX_SAFE_INTEGER }
        },
        async handler (context) {
          const { value, expiresAt } = context.data
          if (expiresAt < Date.now()) {
            throw new Error('A lock must not expire in the past.') 
          }
    
          const hash = getHash(value)
          await this.store.acquireLock(hash, expiresAt)
        }
      },
      isLocked: {
        params: {
          value: { type: 'string' }
        },
        handler (context) {
          const { value } = context.data
          const hash = getHash(value)
          return this.store.isLocked(hash)
        }
      },
      releaseLock: {
        params: {
          value: { type: 'string' }
        },
        handler (context) {
          const { value } = context.data
          const hash = getHash(value)
          return this.store.releaseLock(hash)
        }
      }
    },
    created: function () {
      this.store = lockServiceOptions.lockStore
    }
  }

  return service
}

module.exports = { createLockService }