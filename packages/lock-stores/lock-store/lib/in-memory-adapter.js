const createInMemoryLockStoreAdapter = async (userOptions = {}) => {
  const database = {
    locks: []
  };

  let eventBus;

  async function connect (lockStoreEventBus) {
    eventBus = lockStoreEventBus;
  }

  async function disconnect () {}

  const removeExpiredLocks = async () => {
    database.locks = database.locks.filter(lock => {
      if (lock.expiresAt >= Date.now()) {
        return true;
      } else {
        eventBus.emit('lock-released', {
          key: lock.key,
          expiresAt: lock.expiresAt,
          metadata: lock.metadata
        });
        return false;
      }
    });
  };

  const lock = async (key, expiresAt, metadata) => {
    database.locks.push({ key, expiresAt, metadata });
    eventBus.emit('lock-created', { key, expiresAt, metadata });
  };

  const getLock = async (key) => {
    return database.locks.find(lock => {
      return lock.key === key;
    });
  };

  const isLocked = async (key) => {
    const res = database.locks.some((lock) => {
      return lock.key === key && Date.now() <= lock.expiresAt;
    });

    return res;
  };

  const release = async (key) => {
    await removeExpiredLocks();

    const index = database.locks.findIndex(lock => {
      return lock.key === key;
    });

    // The lock is already released
    if (index === -1) {
      return;
    }

    const existingLock = database.locks.find(lock => {
      return lock.key === key;
    });

    database.locks.splice(index, 1);
    eventBus.emit('lock-released', {
      key: existingLock.key,
      expiresAt: existingLock.expiresAt,
      metadata: existingLock.metadata
    });
  };

  /**
   * Renew the key lock
   * @param {string} key Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (key, expiresAt) => {
    await removeExpiredLocks();

    const existingLock = database.locks.find(lock => {
      return lock.key === key;
    });

    existingLock.expiresAt = expiresAt;
    eventBus.emit('lock-renewed', {
      key: existingLock.key,
      expiresAt: existingLock.expiresAt,
      metadata: existingLock.metadata
    });
  };

  const flush = async () => {
    database.locks = [];
  };

  return { connect, disconnect, removeExpiredLocks, lock, isLocked, renew, release, getLock, flush };
};

module.exports = { createInMemoryLockStoreAdapter };
