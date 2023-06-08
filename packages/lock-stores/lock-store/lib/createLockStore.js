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

  const connect = async () => options.adapter.connect();
  const disconnect = async () => options.adapter.disconnect();

  /**
   * Acquire a lock
   * @param {string} hash Lock hash
   * @param {number} expiresAt Expiring timestamp
   * @return {Promise<void>} Promise
   */
  const acquire = async (hash, expiresAt = Number.MAX_SAFE_INTEGER) => {
    await options.adapter.removeExpiredLocks();
    if (await options.adapter.isLocked(hash)) {
      throw new Error('Failed to acquire lock.');
    }

    const lock = { value: hash, expiresAt };
    await options.adapter.lock(lock);
    // database.locks.push(lock);
  };

  const isLocked = async (hash) => {
    return options.adapter.isLocked(hash);
  };

  const release = async (hash) => {
    await options.adapter.removeExpiredLocks();
    await options.adapter.release(hash);
  };

  /**
   * Renew the value lock
   * @param {string} hash Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (hash, expiresAt) => {
    await options.adapter.removeExpiredLocks();
    const existingLock = await options.adapter.getLock(hash);

    // The lock is already released
    if (!existingLock) {
      throw new Error('Failed to renew lock.');
    }

    await options.adapter.renew(hash, expiresAt);
  };

  return { connect, disconnect, acquire, isLocked, renew, release };
};

module.exports = { createLockStore };
