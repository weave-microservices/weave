const createInMemoryStore = (options = {}) => {
  const database = {
    locks: []
  }

  const removeExpiredLocks = async () => {
    database.locks = database.locks.filter(lock => {
      return lock.expiresAt >= Date.now()
    })
  }

  const acquireLock = async (hash, expiresAt = Number.MAX_SAFE_INTEGER) => {
    await removeExpiredLocks()
    const isLocked = database.locks.some(lock => {
      lock.value === hash
    })

    if (isLocked) {
      throw new Error('Failed to acquire lock.')
    }

    const lock = { value: hash, expiresAt }
    database.locks.push(lock)
  }

  const isLocked = async (hash) => {
    return database.locks.some(lock => {
      return lock.value === hash && Date.now() <= lock.expiresAt
    })
  }

  const releaseLock = async (hash) => {
    await removeExpiredLocks()

    const index = database.locks.findIndex(lock => {
      return lock.value === hash
    })

    // The lock is already released
    if (index === -1) {
      return
    }

    database.locks.splice(index, 1)
  }

  /**
   * Renew the value lock
   * @param {string} hash Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renewLock = async (hash, expiresAt) => {
    await removeExpiredLocks()

    const existingLock = database.locks.find(lock => {
      return lock.value === hash
    })

    // The lock is already released
    if (!existingLock) {
      throw new Error('Failed to renew lock.')
    }

    existingLock.expiresAt = expiresAt
  }

  return { acquireLock, isLocked, renewLock, releaseLock }
}

module.exports = { createInMemoryStore }
