const createLock = () => {
  const locked = new Map()

  function acquire (key, ttl) {
    const lockedItems = locked.get(key)
    if (!lockedItems) {
      locked.set(key, [])
      return Promise.resolve()
    } else {
      return new Promise((resolve) => lockedItems.push(resolve))
    }
  }

  function isLocked (key) {
    return !!locked.has(key)
  }

  function release (key) {
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

  return Object.freeze({
    acquire,
    isLocked,
    release
  })
}

module.exports = { createLock }
