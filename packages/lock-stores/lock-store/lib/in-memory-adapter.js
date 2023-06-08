const createInMemoryLockStoreAdapter = async (userOptions = {}) => {
  const database = {
    locks: []
  };

  const removeExpiredLocks = async () => {
    database.locks = database.locks.filter(lock => {
      return lock.expiresAt >= Date.now();
    });
  };

  const lock = async (lockItem) => {
    database.locks.push(lockItem);
  };

  const getLock = async (hash) => {
    return database.locks.find(lock => {
      return lock.value === hash;
    });
  };

  const isLocked = async (hash) => {
    return database.locks.some((lock) => {
      return lock.value === hash && Date.now() <= lock.expiresAt;
    });
  };

  const release = async (hash) => {
    await removeExpiredLocks();

    const index = database.locks.findIndex(lock => {
      return lock.value === hash;
    });

    // The lock is already released
    if (index === -1) {
      return;
    }

    database.locks.splice(index, 1);
  };

  /**
   * Renew the value lock
   * @param {string} hash Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (hash, expiresAt) => {
    await removeExpiredLocks();

    const existingLock = database.locks.find(lock => {
      return lock.value === hash;
    });

    existingLock.expiresAt = expiresAt;
  };

  return { removeExpiredLocks, lock, isLocked, renew, release, getLock };
};

module.exports = { createInMemoryLockStoreAdapter };
