const EventEmitter = require('events');
const { createInMemoryLockStoreAdapter } = require('./in-memory-adapter.js');

/**
 * Runtime instance state
 * @typedef {Object} LockStore
 * @property {function(string, number):void} acquire Acquire a lock
 * @property {function(string):boolean} isLocked getBalancedEndpoints
 * @property {Array<Endpoint>} getAllEndpoints getAllEndpoints
 * @property {*} getAllEndpointsUniqueNodes getAllEndpointsUniqueNodes
 * @property {function(Context):Promise<any>} emitLocal emitLocal
 * @property {function():Array<any>} list list
*/

/**
 * Runtime instance state
 * @typedef {Object} UserOptions
 * @property {any} adapter - Services started flag.
*/

/**
 * Creates a lock store instance.
 * @param {UserOptions} userOptions Options
 * @returns {LockStore} Lock store instance
 */
const createLockStore = async (userOptions = {}) => {
  const options = {
    adapter: await createInMemoryLockStoreAdapter(),
    ...userOptions
  };

  const eventBus = new EventEmitter();

  const connect = async () => options.adapter.connect(eventBus);
  const disconnect = async () => options.adapter.disconnect();

  /**
   * Acquire a lock
   * @param {string} key Lock hash
   * @param {number} expiresAt Expiring timestamp
   * @param {Object} metadata Metadata
   * @return {Promise<void>} Promise
   */
  const acquire = async (key, expiresAt = Number.MAX_SAFE_INTEGER, metadata = {}) => {
    await options.adapter.removeExpiredLocks();
    if (await options.adapter.isLocked(key)) {
      throw new Error('Failed to acquire lock.');
    }

    await options.adapter.lock(key, expiresAt, metadata);
  };

  const isLocked = async (key) => {
    await options.adapter.removeExpiredLocks();
    return options.adapter.isLocked(key);
  };

  const release = async (key) => {
    await options.adapter.removeExpiredLocks();
    await options.adapter.release(key);
  };

  const flush = async () => {
    await options.adapter.flush();
  };

  /**
   * Renew the value lock
   * @param {string} key Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (key, expiresAt) => {
    await options.adapter.removeExpiredLocks();
    const existingLock = await options.adapter.getLock(key);

    // The lock is already released
    if (!existingLock) {
      throw new Error('Failed to renew lock.');
    }

    await options.adapter.renew(key, expiresAt);
  };

  return { eventBus, connect, disconnect, acquire, isLocked, renew, release, flush };
};

module.exports = { createLockStore };
