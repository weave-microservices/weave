const createLock = () => {
  const locked = new Map()

  return {
    acquire (key, ttl) {
      const lockedItems = locked.get(key)
      if (!lockedItems) {
        locked.set(key, [])
        return Promise.resolve()
      } else {
        return new Promise((resolve) => lockedItems.push(resolve))
      }
    },
    isLocked (key) {
      return !!locked.has(key)
    },
    release (key) {
      const lockedItems = locked.get(key)
      if (lockedItems) {
        if (lockedItems.length > 0) {
          lockedItems.shift()()
        } else {
          locked.delete(key)
        }
      }
      return Promise.resolve()
    }
  }
}

module.exports = { createLock }
